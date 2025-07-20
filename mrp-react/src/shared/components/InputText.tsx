import { InputText as PrimeReactInputText } from "primereact/inputtext";

interface Props {
  label: string;
  name: string;
  required?: boolean;
}

export default function WIPInputText({ label, name, required = false }: Props) {
  return (
    <div className="flex flex-column gap-2">
      <label htmlFor={name}>{label}</label>
      <PrimeReactInputText name={name} required={required} />
    </div>
  );
}
