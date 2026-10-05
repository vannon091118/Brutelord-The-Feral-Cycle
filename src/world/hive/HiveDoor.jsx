// @doc: docs/daten/hive/hivedoor.md#hivedoor
function DoorArch() {
  return (
    <>
      <path d="M-16,58 C-16,42 -9,34 0,34 C9,34 16,42 16,58 Z" fill="var(--color-soil-950)" />
      <path d="M-16,58 C-16,42 -9,34 0,34 C9,34 16,42 16,58" fill="none" stroke="var(--color-hive-700)" strokeWidth="2.6" />
    </>
  );
}

function DoorGlow({ waiting }) {
  return (
    <ellipse
      className="dl-anim dl-core-pulse"
      cx="0"
      cy="50"
      rx="9"
      ry="7"
      fill="url(#dl-core)"
      opacity={waiting ? 1 : 0.45}
      filter="url(#dl-softGlow)"
    />
  );
}

function FormingDungling() {
  return (
    <>
      <ellipse className="dl-anim dl-bulge" cx="0" cy="50" rx="13" ry="10" fill="var(--color-clay-500)" />
      <ellipse className="dl-anim dl-bulge" cx="-2" cy="49" rx="7" ry="5.5" fill="var(--color-clay-600)" style={{ animationDelay: '0.1s' }} />
    </>
  );
}

export function HiveDoor({ waiting }) {
  return <><DoorArch /><DoorGlow waiting={waiting} />{waiting ? <FormingDungling /> : null}</>;
}
