export class PermissionRole {
	name: string;
	required: boolean;
	constructor(name: string, required: boolean) {
		this.name = name;
		this.required = required;
	}

	toString() {
		return `Name: ${this.name} | Required: ${this.required}`;
	}
}
