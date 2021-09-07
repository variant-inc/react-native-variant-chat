import iconAttachment from '../assets/img/icon-attachment.svg';
import iconCamera from '../assets/img/icon-camera.svg';
import iconError from '../assets/img/icon-error.svg';
import iconMic from '../assets/img/icon-mic.svg';
import iconReload from '../assets/img/icon-reload.svg';
import variantLogo from '../assets/img/logo/variant.svg';

export type SvgName =
  | 'variantLogo'
  | 'iconError'
  | 'iconReload'
  | 'iconCamera'
  | 'iconAttachment'
  | 'iconMic';

const svgImages: Record<SvgName, string> = {
  variantLogo,
  iconError,
  iconReload,
  iconCamera,
  iconAttachment,
  iconMic,
};

export const getSvg = (svgName: SvgName): string => {
  const svg = svgImages[svgName];

  if (svg) {
    return svg;
  } else {
    throw new Error(`Could not find SVG "${svgName}"`);
  }
};
