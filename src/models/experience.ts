import mongoose from 'mongoose';

export interface Experience extends mongoose.Document {
	amount: number;
}

export const ExperienceSchema = new mongoose.Schema({
	number: { type: mongoose.Schema.Types.Number, default: 0 },
});

export const ExperienceModel: mongoose.Model<Experience> = mongoose.model('Experience', ExperienceSchema);
