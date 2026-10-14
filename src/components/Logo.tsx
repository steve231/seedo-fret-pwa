import logoImage from "../assets/seedo-logo.png";

export function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return <img src={logoImage} alt="SEEDO" className={`${className} object-contain rounded-lg`} />;
}
