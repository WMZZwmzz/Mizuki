export interface Photo {
	id?: string;
	src: string;
	alt?: string;
	title?: string;
	thumbnail?: string;
	tags?: string[];
	description?: string;
	date?: string;
	location?: string;
	width?: number;
	height?: number;
}

export interface AlbumGroup {
	id: string;
	title: string;
	description?: string;
	cover: string;
	date: string;
	location?: string;
	tags?: string[];
	photos: Photo[];
	// 预加密密文（base64），存在即视为加密相册，构建时直接输出密文
	encryptedContent?: string;
	encrypted?: boolean;
	password?: string;
	passwordHint?: string;
}
