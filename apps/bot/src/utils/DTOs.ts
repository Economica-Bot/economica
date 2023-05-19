import { Member, datasource, User } from '@economica/db';

export async function createUserDTO(id: string) {
	await datasource.getRepository(User).upsert({ id }, ['id']);
	return datasource.getRepository(User).findOneByOrFail({ id });
}

export async function createMemberDTO(userId: string, guildId: string) {
	await createUserDTO(userId);
	await datasource
		.getRepository(Member)
		.upsert({ userId, guildId }, ['userId', 'guildId']);
	return datasource.getRepository(Member).findOneByOrFail({ userId, guildId });
}
