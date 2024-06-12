import React, { FC, useEffect } from "react";

interface ViamSelectProps {
  label: string;
  items: any;
  isLoading: boolean;
  value: any;
  onChange: (value: any) => void;
}

const ViamSelect: React.FC<ViamSelectProps> = ({
  label,
  items,
  isLoading,
  value,
  onChange,
}) => {
  useEffect(() => {
    console.log("Initialising ViamSelect to default value");
    if (items) {
      onChange(items[0]);
    }
  }, [items]);
  return (
    <div className="mb-4">
      <label className="block mb-1">{label}</label>
      {items?.length === 1 ? (
        <input
          type="text"
          value={items[0].name}
          readOnly
          className="w-full border rounded px-2 py-1"
        />
      ) : (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border rounded px-2 py-1"
        >
          {isLoading ? (
            <option>Loading...</option>
          ) : (
            <>
              <option value="">Select {label}</option>

              {
                //@ts-ignore
                items?.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))
              }
            </>
          )}
        </select>
      )}
    </div>
  );
};

export default ViamSelect;
