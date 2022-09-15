import { SlashCommandBuilder } from '@discordjs/builders';
import { Permissions } from 'discord-api-types/globals';

import { ModuleString } from '../typings';

export class EconomicaSlashCommandBuilder extends SlashCommandBuilder {
	public module: ModuleString;

	public format: string;

	public examples: string[] = [];

	public clientPermissions: Permissions | string | number | bigint = '';

	public global = false;

	public enabled = true;

	public setGlobal(global: boolean): this {
		this.global = global;
		return this;
	}

	public setModule(module: ModuleString): this {
		this.module = module;
		return this;
	}

	public setFormat(format: string): this {
		this.format = format;
		return this;
	}

	public setExamples(examples: string[]): this {
		this.examples = examples;
		return this;
	}

	public setClientPermissions(clientPermissions: typeof this.clientPermissions): this {
		this.clientPermissions = clientPermissions;
		return this;
	}

	public setEnabled(enabled: boolean): this {
		this.enabled = enabled;
		return this;
	}

	public override toJSON() {
		return {
			...super.toJSON(),
			module: this.module,
			format: this.format,
			examples: this.examples,
			clientPermissions: this.clientPermissions,
			global: this.global,
			enabled: this.enabled,
			default_member_permissions: this.default_member_permissions,
		};
	}
}
