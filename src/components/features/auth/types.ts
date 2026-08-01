export interface PasswordProtectionProps {
	encryptedContent: string;
	// 解密后内容类型：markdown 需客户端 marked 渲染，html 直接注入
	contentType?: "markdown" | "html";
}

export interface EncryptorProps {
	password?: string | number;
	encryptedContent?: string;
	contentType?: "markdown" | "html";
}
