import React, { useContext, useRef } from "react";
import { FelaComponent, ThemeContext } from "react-fela";

// Local imports
import AddBtn from "../reduxConnections/addBtn";
import { Input } from "./input";
import { LoadingDots } from "./loadingDots";

const addPadding = 30;
const style = {
  addWrapper: ({ theme }) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: `${addPadding}px`,
    background: theme.quaternaryColors.grey,
    borderRadius: `${theme.primary.borderRadius}px`,
  }),
  inputWrapper: {
    flex: 1,
    paddingRight: `${addPadding}px`,
  },
  addTitle: () => ({}),
  addInput: ({ theme }) => ({
    height: "37px",
    margin: "9px 0 0 0",
    background: theme.background,
    color: theme.textColors.secondary,
    "> input::placeholder": {
      color: theme.textColors.tertiary,
    },
  }),
  addButton: () => ({
    width: "50px",
    height: "50px",
    padding: 0,
    borderRadius: "100%",
  }),
  addIcon: () => ({
    width: "24px",
    height: "24px",
  }),
};

export const AddRecipeBox = ({
  disabled,
  currentUrl,
  onInput,
  externalRef,
  style: externalStyle,
  ...props
}) => {
  const theme = useContext(ThemeContext);
  const urlInput = useRef();

  return (
    <FelaComponent style={[style.addWrapper, externalStyle]}>
      {({ className }) => (
        <div className={className} ref={externalRef} {...props}>
          <FelaComponent style={style.inputWrapper}>
            <FelaComponent
              style={[theme.helpers.resetHeaders, style.addTitle]}
              as="h4"
            >
              Lägg till recept
            </FelaComponent>
            <Input
              value={currentUrl}
              style={style.addInput}
              placeholder={disabled ? "Kan ej nå servern" : "Webbadress.."}
              onInput={(e) => onInput(e.target.value)}
              innerRef={urlInput}
            />
          </FelaComponent>
          <div>
            <AddBtn
              style={style.addButton}
              stateKey="addRecipeBtn"
              addPath="/recipes/add"
              value={currentUrl}
              addContent={() => (
                <FelaComponent style={style.addIcon}>
                  {({ className }) => (
                    <svg
                      className={className}
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M12 4v16m8-8H4"></path>
                    </svg>
                  )}
                </FelaComponent>
              )}
              addingContent={() => <LoadingDots />}
              successContent={() => (
                <FelaComponent style={style.addIcon}>
                  {({ className }) => (
                    <svg
                      className={className}
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7"></path>
                    </svg>
                  )}
                </FelaComponent>
              )}
              failContent={() => (
                <FelaComponent style={style.addIcon}>
                  {({ className }) => (
                    <svg
                      className={className}
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"></path>
                    </svg>
                  )}
                </FelaComponent>
              )}
            />
          </div>
        </div>
      )}
    </FelaComponent>
  );
};
