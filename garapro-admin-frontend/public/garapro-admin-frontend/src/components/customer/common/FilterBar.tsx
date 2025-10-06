"use client";

interface FilterOption {
  value: string;
  label: string;
}

interface FilterBarProps {
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
}

export function FilterBar({ options, value, onChange }: FilterBarProps) {
  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm font-medium">Lọc:</span>
      <div className="flex items-center space-x-1">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`px-3 py-1.5 text-sm rounded-md ${value === option.value
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}