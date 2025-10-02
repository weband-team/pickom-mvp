export enum PackageTypeEnum{
    SMALL_PARCEL = 'small-parcel',
    LARGE_PARCEL = 'large-parcel',
    DOCUMENT = 'document',
    OTHER = 'other'
}

export interface PackageType{
  type: PackageTypeEnum;
  notes?: string;
  otherDescription?: string;
}