#include <sdktools>
#include <tf2_stocks>
#include <SteamWorks>
#include <sha1>

#pragma newdecls required

#define HUD_PRINTNOTIFY		1
#define HUD_PRINTCONSOLE	2
#define HUD_PRINTTALK		3
#define HUD_PRINTCENTER		4

//#define DEVELOPER

#if defined DEVELOPER
	#define URL_CHAT  "http://localhost:3008/chat"
	#define URL_FEED  "http://localhost:3008/feed"
	#define URL_PING  "http://localhost:3008/heartbeat"
	#define URL_JOIN  "http://localhost:3008/playerjoin"
	#define URL_LEAVE "http://localhost:3008/playerleave"
	#define URL_INFO  "http://localhost:3008/infochanged"
	#define URL_WAVE  "http://localhost:3008/wavechanged"
#else
	#define URL_CHAT  "https://killfeed.herokuapp.com/chat"
	#define URL_FEED  "https://killfeed.herokuapp.com/feed"
	#define URL_PING  "https://killfeed.herokuapp.com/heartbeat"
	#define URL_JOIN  "https://killfeed.herokuapp.com/playerjoin"
	#define URL_LEAVE "https://killfeed.herokuapp.com/playerleave"
	#define URL_INFO  "https://killfeed.herokuapp.com/infochanged"
	#define URL_WAVE  "https://killfeed.herokuapp.com/wavechanged"
#endif

public Plugin myinfo = 
{
	name = "[TF2] Live Server Data",
	author = "Pelipoika",
	description = "",
	version = "1.0",
	url = "http://www.sourcemod.net/plugins.php?author=Pelipoika&search=1"
};

ConVar g_cSecretKey;
char g_strSecret[PLATFORM_MAX_PATH];

public void OnPluginStart()
{
	g_cSecretKey = CreateConVar("killfeed_secret", "DEFAULT", 
                                "Change this from DEFAULT to something secret or killfeed will not function.", 
                                FCVAR_DONTRECORD|FCVAR_PROTECTED);
	 
	
	//Chat
	HookUserMessage(GetUserMessageId("SayText"),  SayText);
	HookUserMessage(GetUserMessageId("SayText2"), SayText2);
	HookUserMessage(GetUserMessageId("TextMsg"),  TextMsg);
	
	//Killfeed
	HookEvent("player_death",     Event_Death, EventHookMode_Post);
	HookEvent("object_destroyed", Event_Death, EventHookMode_Post);
	
	//Server online.
	SteamWorks_SteamServersConnected();	
	
	for (int i = 1; i <= MaxClients; i++)
	{
		if(!IsClientInGame(i))
			continue;
			
		OnClientAuthorized(i, "");
	}
}

public int SteamWorks_SteamServersConnected()
{
	char ServerID[PLATFORM_MAX_PATH];
	GetServerAuthId(AuthId_SteamID64, ServerID, PLATFORM_MAX_PATH);
	
	if(StrEqual(ServerID, "1")) {
		return;
	}
	
	char ConvarSecretValue[PLATFORM_MAX_PATH];
	g_cSecretKey.GetString(ConvarSecretValue, PLATFORM_MAX_PATH);
	
	if(StrEqual(ConvarSecretValue, "DEFAULT"))
	{
		SetFailState("[serverdata] Please change your \"killfeed_secret\" and reload this plugin or this plugin will not run");
		return;
	}
	
	Format(ServerID, PLATFORM_MAX_PATH, "%s%s", ServerID, ConvarSecretValue);
	
	SHA1String(ServerID, g_strSecret, true);
	
	HeartBeat();
}

public void HeartBeat()
{
	Handle hRequest = CreatePostRequest(URL_PING);
	if(hRequest == null)
		return;
	
	char serverName[PLATFORM_MAX_PATH];
	FindConVar("hostname").GetString(serverName, PLATFORM_MAX_PATH);
	
	char servermap[128];
	
	int objRes = FindEntityByClassname(-1, "tf_objective_resource");
	
	if(GameRules_GetProp("m_bPlayingMannVsMachine") && IsValidEntity(objRes)) 
	{
		//Send popfile name instead of map name for MvM for better info
		GetEntPropString(objRes, Prop_Send, "m_iszMvMPopfileName", servermap, sizeof(servermap));
		
		ReplaceString(servermap, sizeof(servermap), "scripts/population/", "", false);
		ReplaceString(servermap, sizeof(servermap), ".pop", "", false);
	} 
	else 
	{
		GetCurrentMap(servermap, sizeof(servermap));
	}

	SteamWorks_SetHTTPRequestGetOrPostParameter(hRequest, "hostname", serverName);
	SteamWorks_SetHTTPRequestGetOrPostParameter(hRequest, "playercount", IntToStringEx(GetPlayerCount()));
	
	int maxplayers = FindConVar("sv_visiblemaxplayers").IntValue;
	if(maxplayers <= 0)
		maxplayers = MaxClients;
	
	SteamWorks_SetHTTPRequestGetOrPostParameter(hRequest, "maxplayers", IntToStringEx(maxplayers));
	SteamWorks_SetHTTPRequestGetOrPostParameter(hRequest, "map", servermap);
	SteamWorks_SendHTTPRequest(hRequest);
	
	delete hRequest;
	
	//Ping every 30 seconds
	CreateTimer(10.0, Timer_HeartBeat);
}

//Throttle POST rape
float g_flNextUpdate;

//- Scoreboard stuff
//0 iTotalScore
//1 iDamage
//2 iDamageBoss
//3 iHealing
//4 iCurrencyCollected
//5 iClass
//6 iTeam
//7 bAlive
int g_iCachedValues[MAXPLAYERS + 1][10];

//- MVM Wave HUD stuff
//0 iCount
//1 iFlags
//2 iActive
int g_iCachedWaveInfo[24][5] = {
    {-1, ...}, {-1, ...}, {-1, ...}, {-1, ...},
    {-1, ...}, {-1, ...}, {-1, ...}, {-1, ...},
    {-1, ...}, {-1, ...}, {-1, ...}, {-1, ...},
    {-1, ...}, {-1, ...}, {-1, ...}, {-1, ...},
    {-1, ...}, {-1, ...}, {-1, ...}, {-1, ...},
    {-1, ...}, {-1, ...}, {-1, ...}, {-1, ...},
};

//0 WaveNum
//1 WaveNumMAx
//2 m_nMvMEventPopfileType
int g_iCachedBasicWaveInfo[3];

//0 sIcon
char g_iCachedWaveStrings[24][64];

public void OnMapStart()
{
	g_flNextUpdate = 0.0;
	
	//Reset wave info.
	for (int i = 0; i < sizeof(g_iCachedWaveInfo); i++) {
		for (int o = 0; o < sizeof(g_iCachedWaveInfo[]); o++) {
			//PrintToServer("[%i] [%i] = %i", i, o, g_iCachedWaveInfo[i][o]);
			g_iCachedWaveInfo[i][o] = -1;
		}
	}
	
	//Reset wave info strings.
	for (int i = 0; i < sizeof(g_iCachedWaveStrings); i++) {
		g_iCachedWaveStrings[i] = "";
	}
}

//Inform website that a player has joined
public void OnClientAuthorized(int client, const char[] auth)
{
	if(GameRules_GetProp("m_bPlayingMannVsMachine") && IsFakeClient(client))
		return;
	
	char auth64[64];
	if(!GetClientAuthId(client, AuthId_SteamID64, auth64, sizeof(auth64)))
		return;
	
	char name[64];
	GetClientName(client, name, sizeof(name));	
	
	Handle hRequest = CreatePostRequest(URL_JOIN);
	if(hRequest == null)
		return;
	
	SteamWorks_SetHTTPRequestGetOrPostParameter(hRequest, "steam64", auth64);
	SteamWorks_SetHTTPRequestGetOrPostParameter(hRequest, "name", name);
	
	SteamWorks_SendHTTPRequest(hRequest);
	delete hRequest;
}

//Inform website that a player has left
public void OnClientDisconnect(int client)
{
	if(GameRules_GetProp("m_bPlayingMannVsMachine") && IsFakeClient(client))
		return;
	
	char auth64[64];
	if(!GetClientAuthId(client, AuthId_SteamID64, auth64, sizeof(auth64)))
		return;
	
	char name[64];
	GetClientName(client, name, sizeof(name));	
	
	Handle hRequest = CreatePostRequest(URL_LEAVE);
	if(hRequest == null)
		return;
	
	SteamWorks_SetHTTPRequestGetOrPostParameter(hRequest, "steam64", auth64);
	SteamWorks_SetHTTPRequestGetOrPostParameter(hRequest, "name", name);
	
	SteamWorks_SendHTTPRequest(hRequest);
	delete hRequest;
}

//Send server info that we are still alive.
public Action Timer_HeartBeat(Handle timer, any data)
{
	HeartBeat();
}

public void OnGameFrame()
{
	if(g_flNextUpdate > GetGameTime())
		return;

	//PrintToServer("OnGameFrame() Update Data");
	
	CheckPlayerData();
	CheckWaveData();
	CheckBasicWaveData();
	
	g_flNextUpdate = GetGameTime() + 1.0;
}

stock void CheckPlayerData()
{
	Handle hRequest = CreatePostRequest(URL_INFO);
	if(hRequest == null)
		return;
	
	//Do we have any changes?
	bool bChanges = false;
	
	for (int client = 1; client <= MaxClients; client++)
	{
		if(!IsClientInGame(client))
			continue;
		
		if(IsFakeClient(client))
			continue;
		
		char auth64[PLATFORM_MAX_PATH];
		if(!GetClientAuthId(client, AuthId_SteamID64, auth64, sizeof(auth64)))
			continue;
		
		Format(auth64, sizeof(auth64), "info[%s]", auth64);
		
		int PlayerResource = GetPlayerResourceEntity();
	
		//Get
		int iTotalScore        = (GetEntProp(PlayerResource, Prop_Send, "m_iTotalScore",        _, client));
		int iDamage            = (GetEntProp(PlayerResource, Prop_Send, "m_iDamage",            _, client) + GetEntProp(PlayerResource, Prop_Send, "m_iDamageAssist", _, client));
		int iDamageBoss        = (GetEntProp(PlayerResource, Prop_Send, "m_iDamageBoss",        _, client));
		int iHealing           = (GetEntProp(PlayerResource, Prop_Send, "m_iHealing",           _, client));
		int iCurrencyCollected = (GetEntProp(PlayerResource, Prop_Send, "m_iCurrencyCollected", _, client));
		int iClass             = (GetEntProp(PlayerResource, Prop_Send, "m_iPlayerClass",       _, client));
		int iTeam              = (GetTeam(client));
		int bAlive             = (GetEntProp(PlayerResource, Prop_Send, "m_bAlive",             _, client)); 
		
		//Check cache for changes
		if(g_iCachedValues[client][0] != iTotalScore)        { SteamWorks_SetHTTPRequestGetOrPostParameter(hRequest, FormatStringInline(auth64, "[score]"),   IntToStringEx(iTotalScore));        bChanges = true;}
		if(g_iCachedValues[client][1] != iDamage)            { SteamWorks_SetHTTPRequestGetOrPostParameter(hRequest, FormatStringInline(auth64, "[damage]"),  IntToStringEx(iDamage));            bChanges = true;}
		if(g_iCachedValues[client][2] != iDamageBoss)        { SteamWorks_SetHTTPRequestGetOrPostParameter(hRequest, FormatStringInline(auth64, "[tank]"),    IntToStringEx(iDamageBoss));        bChanges = true;}
		if(g_iCachedValues[client][3] != iHealing)           { SteamWorks_SetHTTPRequestGetOrPostParameter(hRequest, FormatStringInline(auth64, "[healing]"), IntToStringEx(iHealing));           bChanges = true;}
		if(g_iCachedValues[client][4] != iCurrencyCollected) { SteamWorks_SetHTTPRequestGetOrPostParameter(hRequest, FormatStringInline(auth64, "[money]"),   IntToStringEx(iCurrencyCollected)); bChanges = true;}
		if(g_iCachedValues[client][5] != iClass)             { SteamWorks_SetHTTPRequestGetOrPostParameter(hRequest, FormatStringInline(auth64, "[pclass]"),  IntToStringEx(iClass));             bChanges = true;}
		if(g_iCachedValues[client][6] != iTeam)              { SteamWorks_SetHTTPRequestGetOrPostParameter(hRequest, FormatStringInline(auth64, "[team]"),    IntToStringEx(iTeam));              bChanges = true;}
		if(g_iCachedValues[client][7] != bAlive)             { SteamWorks_SetHTTPRequestGetOrPostParameter(hRequest, FormatStringInline(auth64, "[alive]"),   IntToStringEx(bAlive));             bChanges = true;}
		
		//Cache
		g_iCachedValues[client][0] = iTotalScore;
		g_iCachedValues[client][1] = iDamage;
		g_iCachedValues[client][2] = iDamageBoss;
		g_iCachedValues[client][3] = iHealing;
		g_iCachedValues[client][4] = iCurrencyCollected;
		g_iCachedValues[client][5] = iClass;
		g_iCachedValues[client][6] = iTeam;
		g_iCachedValues[client][7] = bAlive;

	}
	
	//Send changes
	if(bChanges) {
		SteamWorks_SendHTTPRequest(hRequest);
	}
	
	delete hRequest;
}

stock void CheckWaveData()
{
	int iResource = FindEntityByClassname(-1, "tf_objective_resource");
	if(!IsValidEntity(iResource))
		return;

	Handle hRequest = CreatePostRequest(URL_WAVE);
	if(hRequest == null)
		return;
	
	//Do we have any changes?
	bool bChanges = false;
	
	for (int i = 0; i < 24; i++)
	{
		//Get	
		int iCount   = -1;
		int iFlags   = -1;
		int iActive  = -1;
		
		char sIcon[64]; 
		
		char column[PLATFORM_MAX_PATH]; 
		Format(column, PLATFORM_MAX_PATH, "[%i]", i);
		
		bool bThis = false;
		
		if(i < 12)
		{
			iCount  = (GetEntProp(iResource, Prop_Send, "m_nMannVsMachineWaveClassCounts", _, i)); 
			iFlags  = (GetEntProp(iResource, Prop_Send, "m_nMannVsMachineWaveClassFlags",  _, i));
			iActive = (GetEntProp(iResource, Prop_Send, "m_bMannVsMachineWaveClassActive", _, i));
			GetEntPropString(iResource, Prop_Data, "m_iszMannVsMachineWaveClassNames", sIcon, sizeof(sIcon), i);
		}
		else if (i < 24)
		{
			iCount  = (GetEntProp(iResource, Prop_Send, "m_nMannVsMachineWaveClassCounts2", _, i - 12)); 
			iFlags  = (GetEntProp(iResource, Prop_Send, "m_nMannVsMachineWaveClassFlags2",  _, i - 12));
			iActive = (GetEntProp(iResource, Prop_Send, "m_bMannVsMachineWaveClassActive2", _, i - 12));
			GetEntPropString(iResource, Prop_Data, "m_iszMannVsMachineWaveClassNames2", sIcon, sizeof(sIcon), i - 12);
		} 
		
		if(g_iCachedWaveInfo[i][0] != iCount)         { SteamWorks_SetHTTPRequestGetOrPostParameter(hRequest, FormatStringInline(column, "[count]"),   IntToStringEx(iCount));  bThis = bChanges = true; }
		if(g_iCachedWaveInfo[i][1] != iFlags)         { SteamWorks_SetHTTPRequestGetOrPostParameter(hRequest, FormatStringInline(column, "[flags]"),   IntToStringEx(iFlags));  bThis = bChanges = true; }
		if(g_iCachedWaveInfo[i][2] != iActive)        { SteamWorks_SetHTTPRequestGetOrPostParameter(hRequest, FormatStringInline(column, "[active]"),  IntToStringEx(iActive)); bThis = bChanges = true; }
		
		//if(!StrEqual(g_iCachedWaveStrings[i], sIcon)) { SteamWorks_SetHTTPRequestGetOrPostParameter(hRequest, FormatStringInline(column, "[icon]"),    sIcon);                  bThis = bChanges = true; }
		
		//Add array index to msg
		if(bThis) {
			//Always send icon with every change
			SteamWorks_SetHTTPRequestGetOrPostParameter(hRequest, FormatStringInline(column, "[icon]"),    sIcon); 
			
			SteamWorks_SetHTTPRequestGetOrPostParameter(hRequest, FormatStringInline(column, "[idx]"), IntToStringEx(i));
		}

		//Cache
		g_iCachedWaveInfo[i][0] = iCount;
		g_iCachedWaveInfo[i][1] = iFlags;
		g_iCachedWaveInfo[i][2] = iActive;
		g_iCachedWaveStrings[i] = sIcon;
	}

	//Send changes
	if(bChanges) {
		SteamWorks_SendHTTPRequest(hRequest);
	}
	
	delete hRequest;
}

stock void CheckBasicWaveData()
{
	int iResource = FindEntityByClassname(-1, "tf_objective_resource");
	if(!IsValidEntity(iResource))
		return;

	Handle hRequest = CreatePostRequest(URL_WAVE);
	if(hRequest == null)
		return;
	
	//Do we have any changes?
	bool bChanges = false;
	
	//Get
	int iWave    = (GetEntProp(iResource, Prop_Send, "m_nMannVsMachineWaveCount")); 
	int iWaveMax = (GetEntProp(iResource, Prop_Send, "m_nMannVsMachineMaxWaveCount"));
	int iPopType = (GetEntProp(iResource, Prop_Send, "m_nMvMEventPopfileType"));
	
	//Check
	if(g_iCachedBasicWaveInfo[0] != iWave)    { SteamWorks_SetHTTPRequestGetOrPostParameter(hRequest, "wave",    IntToStringEx(iWave));    bChanges = true;}
	if(g_iCachedBasicWaveInfo[1] != iWaveMax) { SteamWorks_SetHTTPRequestGetOrPostParameter(hRequest, "wavemax", IntToStringEx(iWaveMax)); bChanges = true;}
	if(g_iCachedBasicWaveInfo[2] != iPopType) { SteamWorks_SetHTTPRequestGetOrPostParameter(hRequest, "poptype", IntToStringEx(iPopType)); bChanges = true;}

	//Cache
	g_iCachedBasicWaveInfo[0] = iWave;
	g_iCachedBasicWaveInfo[1] = iWaveMax;
	g_iCachedBasicWaveInfo[2] = iPopType;
	
	//Send
	if(bChanges) {
		SteamWorks_SendHTTPRequest(hRequest);
	}
	
	delete hRequest;
}

stock char[] FormatStringInline(const char[] pretext, const char[] postpretext)
{
	char s[PLATFORM_MAX_PATH];
	Format(s, PLATFORM_MAX_PATH, "%s%s", pretext, postpretext);
	return s;
}

public void Event_Death(Event event, const char[] name, bool dontBroadcast)
{
	if(dontBroadcast || event.GetInt("BroadcastDisabled") > 0) {
		return;
	}

	Handle hRequest = CreatePostRequest(URL_FEED);
	if(hRequest == null)
		return;
	
	char attacker[64];
	int iattacker = GetClientOfUserId(event.GetInt("attacker"));
	if(iattacker > 0) GetClientName(iattacker, attacker, sizeof(attacker));	
	
	char assister[64];
	int iassister = GetClientOfUserId(event.GetInt("assister"));
	if(iassister > 0) GetClientName(iassister, assister, sizeof(assister));
	
	char victim[64];
	int ivictim = GetClientOfUserId(event.GetInt("userid"));
	if(ivictim > 0) GetClientName(ivictim, victim, sizeof(victim));

	char weapon_logclassname[64];
	event.GetString("weapon", weapon_logclassname, sizeof(weapon_logclassname));
	
	SteamWorks_SetHTTPRequestGetOrPostParameter(hRequest, "event", name);
	SteamWorks_SetHTTPRequestGetOrPostParameter(hRequest, "weapon", weapon_logclassname);
	SteamWorks_SetHTTPRequestGetOrPostParameter(hRequest, "attacker", attacker);
	SteamWorks_SetHTTPRequestGetOrPostParameter(hRequest, "assister", assister);
	SteamWorks_SetHTTPRequestGetOrPostParameter(hRequest, "victim", victim);
	SteamWorks_SetHTTPRequestGetOrPostParameter(hRequest, "attackerteam", IntToStringEx(GetTeam(iattacker)));
	SteamWorks_SetHTTPRequestGetOrPostParameter(hRequest, "victimteam",   IntToStringEx(GetTeam(ivictim)));
	
	if(StrEqual(name, "player_death"))
	{
		SteamWorks_SetHTTPRequestGetOrPostParameter(hRequest, "damagebits",      IntToStringEx(event.GetInt("damagebits")));
		SteamWorks_SetHTTPRequestGetOrPostParameter(hRequest, "customkill",      IntToStringEx(event.GetInt("customkill")));
		SteamWorks_SetHTTPRequestGetOrPostParameter(hRequest, "death_flags",     IntToStringEx(event.GetInt("death_flags")));
		SteamWorks_SetHTTPRequestGetOrPostParameter(hRequest, "kill_streak_wep", IntToStringEx(event.GetInt("kill_streak_wep")));
	}
	
	if(StrEqual(name, "object_destroyed"))
	{
		SteamWorks_SetHTTPRequestGetOrPostParameter(hRequest, "objecttype", IntToStringEx(event.GetInt("objecttype")));
	}
	
	SteamWorks_SendHTTPRequest(hRequest);
	delete hRequest;

//	PrintToServer("\"%s\" + \"%s\"  \"%s\"  \"%s\"", attacker, assister, weapon_logclassname, victim);
}


bool SayTextd = false;
public Action SayText(UserMsg msg_id, BfRead msg, const int[] players, int playersNum, bool reliable, bool init)
{
	if(SayTextd) {
		return Plugin_Continue;
	}

	BfReadByte(msg);
	
	char pText[PLATFORM_MAX_PATH];
	BfReadString(msg, pText, sizeof(pText));
	
	BfReadByte(msg);
	
	//PrintToServer(" - SayText \"%i\" \"%s\" \"%i\"", iSender, pText, bChat);
	
	Handle hRequest = CreatePostRequest(URL_CHAT);
	if(hRequest == null)
		return Plugin_Continue;

	SteamWorks_SetHTTPRequestGetOrPostParameter(hRequest, "steam64", "");
	SteamWorks_SetHTTPRequestGetOrPostParameter(hRequest, "type", pText);
	SteamWorks_SetHTTPRequestGetOrPostParameter(hRequest, "sender", "SERVER");
	SteamWorks_SetHTTPRequestGetOrPostParameter(hRequest, "team", "5");
	SteamWorks_SetHTTPRequestGetOrPostParameter(hRequest, "message", pText);
	SteamWorks_SendHTTPRequest(hRequest);
	delete hRequest;
	
	SayTextd = true;
	
	RequestFrame(SayTextC);
	
	return Plugin_Continue;
}
void SayTextC(int no) {	SayTextd = false; }

bool SayText2d = false;
public Action SayText2(UserMsg msg_id, BfRead msg, const int[] players, int playersNum, bool reliable, bool init)
{
	if(SayText2d) {
		return Plugin_Continue;
	}

	int iSender = BfReadByte(msg);
	BfReadByte(msg);
	
	//TF_Chat_All
	char msg_name[PLATFORM_MAX_PATH];
	BfReadString(msg, msg_name, sizeof(msg_name));
	
	//Sender name
	char param1[PLATFORM_MAX_PATH];
	BfReadString(msg, param1, sizeof(param1));
	
	//Senders message
	char param2[PLATFORM_MAX_PATH];
	BfReadString(msg, param2, sizeof(param2));

	//PrintToServer(" - SayText2 \"%i\" \"%i\" \"%s\" \"%s\" \"%s\"", iSender, bChat, msg_name, param1, param2);
	
	SayText2d = true;
	
	RequestFrame(SayText2C);
	
	// - SayText2 "10" "1" "TF_Chat_All" "Pelipoika" "Hi guys ! :))"
	
	Handle hRequest = CreatePostRequest(URL_CHAT);
	if(hRequest == null)
		return Plugin_Continue;
		
	if(iSender > 0 && IsClientInGame(iSender))
	{
		char auth64[64];
		GetClientAuthId(iSender, AuthId_SteamID64, auth64, sizeof(auth64));
		
		SteamWorks_SetHTTPRequestGetOrPostParameter(hRequest, "steam64", auth64);
	}

	SteamWorks_SetHTTPRequestGetOrPostParameter(hRequest, "type", msg_name);
	SteamWorks_SetHTTPRequestGetOrPostParameter(hRequest, "sender", param1);
	SteamWorks_SetHTTPRequestGetOrPostParameter(hRequest, "team", IntToStringEx(GetTeam(iSender)));
	SteamWorks_SetHTTPRequestGetOrPostParameter(hRequest, "message", param2);
	SteamWorks_SendHTTPRequest(hRequest);
	delete hRequest;
	
	
	return Plugin_Continue;
}
void SayText2C(int no) { SayText2d = false; }

bool TextMsgd = false;
int TextMsgTriggered = 0;
public Action TextMsg(UserMsg msg_id, BfRead msg, const int[] players, int playersNum, bool reliable, bool init)
{
	if(TextMsgd) {
		TextMsgTriggered++;
		return Plugin_Continue;
	}
	
	int iDest = BfReadByte(msg);
	
	char msg_name[PLATFORM_MAX_PATH];
	BfReadString(msg, msg_name, sizeof(msg_name));
	
	char param1[PLATFORM_MAX_PATH];
	BfReadString(msg, param1, sizeof(param1));

	if(iDest == HUD_PRINTTALK)
	{
		//PrintToServer(" - TextMsg \"%s\" \"%s\"", msg_name, param1);
		
		TextMsgd = true;
		TextMsgTriggered = 1;
		
		Handle hRequest = CreatePostRequest(URL_CHAT);
		if(hRequest == null)
			return Plugin_Continue;
		
		SteamWorks_SetHTTPRequestGetOrPostParameter(hRequest, "steam64", "");
		SteamWorks_SetHTTPRequestGetOrPostParameter(hRequest, "type", msg_name);
		SteamWorks_SetHTTPRequestGetOrPostParameter(hRequest, "sender", "SERVER");
		SteamWorks_SetHTTPRequestGetOrPostParameter(hRequest, "team", "5");
		SteamWorks_SetHTTPRequestGetOrPostParameter(hRequest, "message", msg_name);
		SteamWorks_SendHTTPRequest(hRequest);
		delete hRequest;
		
		RequestFrame(TextMsgC);
	}
	
	return Plugin_Continue;
}
void TextMsgC(int no) { TextMsgd = false; }


/*

/////////Old bad
public void OnConVarChanged(ConVar convar, const char[] oldValue, const char[] newValue)
{
	char CVarName[PLATFORM_MAX_PATH];
	convar.GetName(CVarName, PLATFORM_MAX_PATH);
	
	Handle hRequest = CreatePostRequest("serverInfoChanged");
	if(hRequest == null)
		return;
	
	SteamWorks_SetHTTPRequestGetOrPostParameter(hRequest, "ConVar", CVarName);
	SteamWorks_SetHTTPRequestGetOrPostParameter(hRequest, "oldValue", oldValue);
	SteamWorks_SetHTTPRequestGetOrPostParameter(hRequest, "newValue", newValue);
	
	SteamWorks_SendHTTPRequest(hRequest);
	delete hRequest;
}

public void OnPluginEnd()
{
	Handle hRequest = CreatePostRequest("serverOffline");
	if(hRequest == null)
		return;
	
	SteamWorks_SendHTTPRequest(hRequest);
	delete hRequest;
}

public void OnMapStart()
{
	Handle hRequest = CreatePostRequest("serverInfoChanged");
	if(hRequest == null)
		return;
		
	char Buffer[PLATFORM_MAX_PATH];
	GetCurrentMap(Buffer, PLATFORM_MAX_PATH);
	SteamWorks_SetHTTPRequestGetOrPostParameter(hRequest, "Map", Buffer);
	
	SteamWorks_SendHTTPRequest(hRequest);
	delete hRequest;
}

public void OnClientAuthorized(int client, const char[] auth)
{
	if(IsFakeClient(client))
		return;
	
	Handle hRequest = CreatePostRequest("serverInfoChanged");
	if(hRequest == null)
		return;
	
	char Buffer[12];
	Format(Buffer, sizeof(Buffer), "%i", GetPlayerCount());
	SteamWorks_SetHTTPRequestGetOrPostParameter(hRequest, "PlayerCount", Buffer);
	
	SteamWorks_SendHTTPRequest(hRequest);
	delete hRequest;
}

public void OnClientDisconnect_Post(int client)
{
	Handle hRequest = CreatePostRequest("serverInfoChanged");
	if(hRequest == null)
		return;
	
	char Buffer[12];
	Format(Buffer, sizeof(Buffer), "%i", GetPlayerCount());
	SteamWorks_SetHTTPRequestGetOrPostParameter(hRequest, "PlayerCount", Buffer);
	
	SteamWorks_SendHTTPRequest(hRequest);
	delete hRequest;
}

public void AddConvarParameter(Handle hRequest, const char[] key, const char[] convar)
{
	char strBuffer[PLATFORM_MAX_PATH];
	FindConVar(convar).GetString(strBuffer, PLATFORM_MAX_PATH);
	
	SteamWorks_SetHTTPRequestGetOrPostParameter(hRequest, key, strBuffer);
}

stock char TF2_GetPlayerClassName(int client)
{
	char strClass[32];
	
	if(IsClientConnected(client) && IsClientInGame(client))
	{	
		switch(TF2_GetPlayerClass(client))
		{
			case TFClass_Unknown:	Format(strClass, sizeof(strClass), "unknown");
			case TFClass_Scout:		Format(strClass, sizeof(strClass), "scout");
			case TFClass_Sniper:	Format(strClass, sizeof(strClass), "sniper");
			case TFClass_Soldier:	Format(strClass, sizeof(strClass), "soldier");
			case TFClass_DemoMan:	Format(strClass, sizeof(strClass), "demo");
			case TFClass_Medic:		Format(strClass, sizeof(strClass), "medic");
			case TFClass_Heavy:		Format(strClass, sizeof(strClass), "heavy");
			case TFClass_Pyro:		Format(strClass, sizeof(strClass), "pyro");
			case TFClass_Spy:		Format(strClass, sizeof(strClass), "spy");
			case TFClass_Engineer:	Format(strClass, sizeof(strClass), "engineer");
		}
	}
	else
	{
		Format(strClass, sizeof(strClass), "unknown");
	}
	
	return strClass;
}
*/

public Handle CreatePostRequest(const char[] destination)
{
	Handle hRequest = SteamWorks_CreateHTTPRequest(k_EHTTPMethodPOST, destination);
	
	char Buffer[PLATFORM_MAX_PATH];
	GetServerAuthId(AuthId_SteamID64, Buffer, PLATFORM_MAX_PATH);
	
	if(StrEqual(Buffer, "1"))
	{
		delete hRequest;
		return null;
	}
	
	SteamWorks_SetHTTPRequestGetOrPostParameter(hRequest, "secret", g_strSecret);
	SteamWorks_SetHTTPRequestGetOrPostParameter(hRequest, "serverid", Buffer);
	
	return hRequest;
}

char[] IntToStringEx(int integer)
{
	char buffer[32];
	IntToString(integer, buffer, sizeof(buffer));
	
	return buffer;
}

stock int GetPlayerCount(bool bBots = false)
{
	int iCount = 0;
	
	for (int i = 1; i <= MaxClients; i++) 
	{
		if(!IsClientConnected(i))
			continue;
			
		if(!bBots && IsFakeClient(i))
			continue;
		
		iCount++;
	}
	
	return iCount;
}

stock int GetTeam(int entity)
{
	return GetEntProp(entity, Prop_Send, "m_iTeamNum");
}