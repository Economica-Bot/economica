export class PermissionRole {
	name: string;
	required: boolean;
	constructor(name: string, required: boolean) {
		this.name = name;
		this.required = required;
	}
}
