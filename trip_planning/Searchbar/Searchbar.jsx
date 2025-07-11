import { useState } from "react";
import "./Searchbar.css";

const SearchBar = ({ placeholder = "Search tourist attractions...", suggestions = [], onSearch }) => {
  const [query, setQuery] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  // Handle input change
  const handleChange = (e) => {
    setQuery(e.target.value);
    setShowPopup(true);
    onSearch(e.target.value); // Pass search query to parent component
  };

  // Handle selecting a suggestion
  const handleSelect = (place) => {
    setQuery(place);
    onSearch(place); // Update search in parent component
    setShowPopup(false);
  };

  // Filter suggestions based on user input
  const filteredSuggestions = suggestions.filter((place) =>
    place.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="search-bar" style={{ position: "relative" }}>
      {/* Search Input */}
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={handleChange}
        onFocus={() => setShowPopup(true)}
        onBlur={() => setTimeout(() => setShowPopup(false), 200)}
      />

      {/* Popup Suggestions */}
      {showPopup && filteredSuggestions.length > 0 && (
        <div className="popup">
          <p><b>Famous tourist attractions:</b></p>
          <ul>
            {filteredSuggestions.map((place, index) => (
              <li key={index} onMouseDown={() => handleSelect(place)}>
                {place}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
