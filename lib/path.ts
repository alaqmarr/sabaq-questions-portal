import { usePathname } from "next/navigation";

const _currentPath = usePathname();

console.log(_currentPath);

export default _currentPath;