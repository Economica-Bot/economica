export async function asyncSome(arr: Array<any>, cond: (arr: any) => Promise<boolean>) {
	return new Promise((res, rej) => {
		let pArr = arr.map(async e => {
			if (await cond(e))
				res(true);
		});

		Promise.all(pArr).then(() => res(false))
	})
}