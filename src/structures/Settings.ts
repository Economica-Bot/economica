interface BaseSetting {
	disabled: Boolean;
	cooldown: Number;
}

export interface ModuleSetting extends BaseSetting {
	module: String;
}

export interface ChannelSetting extends BaseSetting {
	channel: String;
}

export interface RoleSetting extends BaseSetting {
	role: String;
}

export interface CommandSetting extends BaseSetting {
	command: String;
}
