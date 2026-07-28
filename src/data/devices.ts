// Auto-generated from Keystatic CMS — DO NOT EDIT MANUALLY
// Edit via: http://localhost:4321/keystatic/

export interface Device {
  name: string;
  image: string;
  specs: string;
  description: string;
  link: string;
}

export type DeviceCategory = Record<string, Device[]> & { 自定义?: Device[] };

export const devicesData: DeviceCategory = {

};
