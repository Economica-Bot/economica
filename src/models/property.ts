import mongoose from 'mongoose';

import { IndustryString } from './corporations';

export type PropertyString =
	| 'OIL_REFINERY'
	| 'PLASTIC_FACTORY'
	| 'LUMBER_PLANT'
	| 'TEXTILE_MILL'
	| 'SUPERMARKET'
	| 'WAREHOUSE_STORE'
	| 'MALL'
	| 'ORCHARD'
	| 'HYDROPONIC_FARM'
	| 'TRADITIONAL_FARM'
	| 'LIVESTOCK'
	| 'BULLDOZER'
	| 'FRONT_LOADER'
	| 'DUMP_TRUCK'
	| 'BACKHOE'
	| 'TRENCHER'
	| 'CRANE'
	| 'PRESCHOOL'
	| 'KINDERGARTEN'
	| 'ELEMENTARY_SCHOOL'
	| 'INTERMEDIATE_SCHOOL'
	| 'SECONDARY_SCHOOL'
	| 'COLLEGE'
	| 'UNIVERSITY'
	| 'PHONE_ASSEMBLY_LINE'
	| 'COMPUTER_ASSEMBLY_LINE'
	| 'TABLET_ASSEMBLY_LINE'
	| 'COMPACT_CAR'
	| 'BUS'
	| 'STEAM_LOCOMOTIVE'
	| 'DIESEL_LOCOMOTIVE'
	| 'ELECTRIC_LOCOMOTIVE'
	| 'CESSNA'
	| 'JUMBO_JET';

export const Properties: Record<PropertyString, IndustryString> = {
	TEXTILE_MILL: 'MANUFACTURING',
	OIL_REFINERY: 'MANUFACTURING',
	PLASTIC_FACTORY: 'MANUFACTURING',
	LUMBER_PLANT: 'MANUFACTURING',
	SUPERMARKET: 'RETAIL',
	WAREHOUSE_STORE: 'RETAIL',
	MALL: 'RETAIL',
	ORCHARD: 'AGRICULTURE',
	HYDROPONIC_FARM: 'AGRICULTURE',
	TRADITIONAL_FARM: 'AGRICULTURE',
	LIVESTOCK: 'AGRICULTURE',
	BULLDOZER: 'CONSTRUCTION',
	FRONT_LOADER: 'CONSTRUCTION',
	DUMP_TRUCK: 'CONSTRUCTION',
	BACKHOE: 'CONSTRUCTION',
	TRENCHER: 'CONSTRUCTION',
	CRANE: 'CONSTRUCTION',
	PRESCHOOL: 'EDUCATION',
	KINDERGARTEN: 'EDUCATION',
	ELEMENTARY_SCHOOL: 'EDUCATION',
	INTERMEDIATE_SCHOOL: 'EDUCATION',
	SECONDARY_SCHOOL: 'EDUCATION',
	COLLEGE: 'EDUCATION',
	UNIVERSITY: 'EDUCATION',
	PHONE_ASSEMBLY_LINE: 'TECHNOLOGY',
	COMPUTER_ASSEMBLY_LINE: 'TECHNOLOGY',
	TABLET_ASSEMBLY_LINE: 'TECHNOLOGY',
	COMPACT_CAR: 'TRANSPORATION',
	BUS: 'TRANSPORATION',
	STEAM_LOCOMOTIVE: 'TRANSPORATION',
	DIESEL_LOCOMOTIVE: 'TRANSPORATION',
	ELECTRIC_LOCOMOTIVE: 'TRANSPORATION',
	CESSNA: 'TRANSPORATION',
	JUMBO_JET: 'TRANSPORATION',
};

export interface Property extends mongoose.Types.Subdocument {
	type: PropertyString;
}

export const PropertySchema = new mongoose.Schema<Property>(
	{
		type: { type: mongoose.Schema.Types.String, required: true },
	},
	{
		versionKey: false,
	},
);

export const PropertyModel: mongoose.Model<Property> = mongoose.model('Property', PropertySchema);
