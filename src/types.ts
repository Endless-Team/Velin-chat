export type MongoObjectId = {
	buffer: Uint8Array;
};

export type User = {
	_id: String;
	username: string;
	servers: MongoObjectId[];
};

export type Channel = {
	_id: MongoObjectId;
	name: string;
	type: string;
};

export type Server = {
	_id: MongoObjectId;
	name: string;
	src: string;
	channels: Channel[];
};
