import mongoose from 'mongoose';

import { MONGO_URI } from '../config';
import { EconomicaClient, EconomicaService } from '../structures';

export default class implements EconomicaService {
	name = 'connect-mongo';
	execute = async (client: EconomicaClient) => {
		console.log(`Executing service ${this.name}`);
		const options = {
			useUnifiedTopology: true,
			useNewUrlParser: true,
			useFindAndModify: false,
		};

		await mongoose.connect(MONGO_URI, options);
	};
}
