import { logoPaths } from "@/components/brand/logo-paths";

type AcademyWordmarkProps = Omit<React.SVGProps<SVGSVGElement>, "width" | "height"> & {
  width?: number;
  height?: number;
};

export function AcademyWordmark({ width = 220, height = 52, className = "brand-wordmark", ...props }: AcademyWordmarkProps) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 60" width={width} height={height}
    className={className} role="img" aria-label="SA-studios" {...props}>
    <g className="wordmark-mark" transform="translate(0 2) scale(.084)">
      <path className="logo-shell" fillRule="evenodd" d={logoPaths.shell} />
      <path className="logo-main" fillRule="evenodd" d={logoPaths.main} />
      <path className="logo-deep" fillRule="evenodd" d={logoPaths.deep} />
    </g>
    <text className="wordmark-text" x="68" y="39">SA-studios</text>
  </svg>;
}
