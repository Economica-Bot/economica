import {
	RESTAPIPartialCurrentUserGuild,
	RESTGetAPICurrentUserGuildsResult,
	RESTGetAPICurrentUserResult,
} from 'discord-api-types/v10';
import { createContext, FC, ReactChildren, useContext, useEffect, useState } from 'react';

export type AppContextType = {
	user: RESTGetAPICurrentUserResult | undefined;
	setUser: (user: RESTGetAPICurrentUserResult) => void;
	guilds: RESTGetAPICurrentUserGuildsResult;
	setGuilds: (guilds: RESTGetAPICurrentUserGuildsResult) => void;
};

export const AppContext = createContext<AppContextType>({
	user: undefined,
	setUser: () => {},
	guilds: [] || undefined,
	setGuilds: () => {},
});

type Props = {
	user: RESTGetAPICurrentUserResult;
	setUser: (user: RESTGetAPICurrentUserResult) => void;
	guilds: RESTAPIPartialCurrentUserGuild[];
	setGuilds: (guilds: RESTAPIPartialCurrentUserGuild) => void;
};

export const useAppContext = () => useContext(AppContext);
