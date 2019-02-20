import React from "react";
import PropTypes from "prop-types";
import deburr from "lodash/deburr";
import Downshift from "downshift";
import { withStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Paper from "@material-ui/core/Paper";
import MenuItem from "@material-ui/core/MenuItem";
import Chip from "@material-ui/core/Chip";
import {
  ITEMS,
  MONSTERS,
  GATHER
} from "renderer/components/AutoComplete/types";

function renderInput(inputProps) {
  const { InputProps, classes, ref, ...other } = inputProps;

  return (
    <TextField
      InputProps={{
        inputRef: ref,
        classes: {
          root: classes.inputRoot,
          input: classes.inputInput
        },
        ...InputProps
      }}
      {...other}
    />
  );
}

function checkIfAvailablePic(type, id) {
  const getPicture = (type, id) => (
    <img
      src={`https://ankama.akamaized.net/games/dofus-tablette/assets/2.22.1/gfx/${type}/${id}.png`}
      style={{ height: "46px", position: "absolute", right: 0 }}
    />
  );

  switch (type) {
    case ITEMS:
      return getPicture("items", id);

    case MONSTERS:
      return getPicture("monsters", id);

    case GATHER:
      break;

    default:
      break;
  }
}

function renderSuggestion({
  suggestions,
  index,
  itemProps,
  highlightedIndex,
  selectedItem,
  type
}) {
  const isHighlighted = highlightedIndex === index;
  const isSelected = (selectedItem || "").indexOf(suggestions.label) > -1;

  return (
    <MenuItem
      {...itemProps}
      key={suggestions.id}
      selected={isHighlighted}
      component="div"
      style={{
        fontWeight: isSelected ? 500 : 400
      }}
    >
      {suggestions.label}
      {checkIfAvailablePic(
        type,
        suggestions.iconId ? suggestions.iconId : null
      )}
    </MenuItem>
  );
}
renderSuggestion.propTypes = {
  highlightedIndex: PropTypes.number,
  index: PropTypes.number,
  itemProps: PropTypes.object,
  selectedItem: PropTypes.string,
  suggestions: PropTypes.shape({ label: PropTypes.string }).isRequired,
  type: PropTypes.string
};

function getSuggestions(value, suggestions) {
  const inputValue = deburr(value.trim()).toLowerCase();
  const inputLength = inputValue.length;
  let count = 0;

  return inputLength === 0
    ? []
    : suggestions.filter(suggestions => {
        const keep =
          count < 5 &&
          suggestions.label &&
          suggestions.label.slice(0, inputLength).toLowerCase() === inputValue;

        if (keep) {
          count += 1;
        }

        return keep;
      });
}

class DownshiftMultiple extends React.Component {
  state = {
    inputValue: "",
    selectedItem: []
  };

  render() {
    const {
      classes,
      suggestions,
      label,
      placeholder,
      type,
      onChange,
      selectedItem,
      inputValue,
      handleDelete,
      handleInputChange,
      handleKeyDown
    } = this.props;

    return (
      <Downshift
        id="downshift-multiple"
        inputValue={inputValue}
        onChange={onChange}
        selectedItem={selectedItem}
        // style={{ width: "100%" }}
      >
        {({
          getInputProps,
          getItemProps,
          isOpen,
          inputValue: inputValue2,
          selectedItem: selectedItem2,
          highlightedIndex
        }) => (
          <div className={classes.container}>
            {renderInput({
              fullWidth: true,
              classes,
              InputProps: getInputProps({
                startAdornment: selectedItem.map(item => (
                  <Chip
                    key={item}
                    tabIndex={-1}
                    label={item}
                    className={classes.chip}
                    onDelete={handleDelete(item)}
                  />
                )),
                onChange: handleInputChange,
                onKeyDown: handleKeyDown,
                placeholder: placeholder
              }),
              label: label
            })}
            {isOpen ? (
              <Paper className={classes.paper} square>
                {getSuggestions(inputValue2, suggestions).map(
                  (suggestion, index) =>
                    renderSuggestion({
                      suggestions: suggestion,
                      index,
                      itemProps: getItemProps({ item: suggestion.label }),
                      highlightedIndex,
                      selectedItem: selectedItem2,
                      type
                    })
                )}
              </Paper>
            ) : null}
          </div>
        )}
      </Downshift>
    );
  }
}

DownshiftMultiple.propTypes = {
  classes: PropTypes.object.isRequired,
  suggestions: PropTypes.array.isRequired,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  inputValue: PropTypes.string,
  type: PropTypes.string,
  selectedItem: PropTypes.array,
  onChange: PropTypes.func,
  handleDelete: PropTypes.func,
  handleInputChange: PropTypes.func,
  handleKeyDown: PropTypes.func
};

const styles = theme => ({
  root: {
    flexGrow: 1,
    height: 250
  },
  container: {
    flexGrow: 1,
    position: "relative"
  },
  paper: {
    position: "absolute",
    zIndex: 1,
    marginTop: theme.spacing.unit,
    left: 0,
    right: 0
  },
  chip: {
    margin: `${theme.spacing.unit / 2}px ${theme.spacing.unit / 4}px`
  },
  inputRoot: {
    flexWrap: "wrap"
  },
  inputInput: {
    width: "auto",
    flexGrow: 1
  },
  divider: {
    height: theme.spacing.unit * 2
  }
});

export default withStyles(styles)(DownshiftMultiple);
