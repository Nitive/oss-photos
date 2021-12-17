export interface Metadata {
  generatedAt: string
  photos: Photo[]
}

export interface Photo {
  s3Key: string
  s3ETag: string
  deleted: boolean
  favorite: boolean
  hidden: boolean

  exif?: Partial<{
    Make: string
    Model: string
    Orientation: string
    XResolution: number
    YResolution: number
    ResolutionUnit: string
    Software: string
    ModifyDate: Date
    HostComputer: string
    TileWidth?: number
    TileLength?: number
    YCbCrPositioning: number
    ExposureTime: number
    FNumber: number
    ExposureProgram: string
    ISO: number
    ExifVersion: string
    DateTimeOriginal: Date
    CreateDate: Date
    OffsetTime: string
    OffsetTimeOriginal: string
    OffsetTimeDigitized: string
    ComponentsConfiguration: { [key: string]: number }
    ShutterSpeedValue: number
    ApertureValue: number
    BrightnessValue: number
    ExposureCompensation: number
    MeteringMode: string
    Flash: string
    FocalLength: number
    SubjectArea?: { [key: string]: number }
    SubSecTimeOriginal: string
    SubSecTimeDigitized: string
    FlashpixVersion: string
    ColorSpace: number
    ExifImageWidth: number
    ExifImageHeight: number
    SensingMethod: string
    SceneType: string
    ExposureMode: string
    WhiteBalance: string
    FocalLengthIn35mmFormat: number
    SceneCaptureType: string
    LensInfo: number[]
    LensMake: string
    LensModel: string
    CompositeImage: string
    DigitalZoomRatio?: number
    CustomRendered?: string
  }>
}
