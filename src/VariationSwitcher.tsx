import * as React from "react";
import GrowthBookUser from "@growthbook/growthbook/dist/user";
import "./styles.css"

export default function VariationSwitcher({
  forceVariation,
  user
}: {
  forceVariation: (key: string, variation: number) => void,
  user?: GrowthBookUser
  renderCount: number
}): null | React.ReactElement { 
  const [variations, setVariations] = React.useState<Map<string, {
    assigned: number;
    possible: any[];
  }>>(new Map());
  const [open, setOpen] = React.useState(true);

  React.useEffect(() => {
    if (!user) return;

    const unsubscriber = user.subscribe(() => {
      requestAnimationFrame(() => {
        setVariations(user.getAssignedVariations());
      })
    });
    console.log(user.getAssignedVariations())
    setVariations(user.getAssignedVariations());
    return unsubscriber;
  }, [user]);

  if (!variations.size) {
    return null;
  }

  return (
    <div className="growthbook_dev">
      <h3>Growth Book Dev</h3>
      <a className="toggle" onClick={() => {
        setOpen(o=>!o);
      }}>{open ? '-' : '+'}</a>
      {Array.from(variations).map(([key, { assigned, possible }]) => {
        return (
          <div className="exp" key={key}>
            <h5>{key}</h5>
            <table>
              <tbody>
                {possible.map((value, i) => (
                  <tr
                    key={i}
                    className={assigned === i ? 'current' : ''}
                    onClick={(e) => {
                      e.preventDefault();
                      forceVariation(key, i);
                    }}
                  >
                    <th>{i}</th>
                    <td>{JSON.stringify(value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      })}
    </div>
  )
}