import pesel from '../kit/native-icons/pesel.svg?raw';
export { ServiceIcon as ReferenceServiceIcon } from '../kit/ServiceIcon';

const heroSource = pesel
  .replaceAll('fill="white"', 'fill="#DFC7FE"')
  .replace(/<path d="M12\.7364[^>]*\/>/, '');
const heroURL = `data:image/svg+xml,${encodeURIComponent(heroSource)}`;
/** Reference hero uses an open lock knocked out of its shield, unlike the list icon. */
export function ReferencePeselHero() {
  return <img src={heroURL} alt="" aria-hidden="true" width={40} height={40} />;
}
