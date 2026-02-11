import { allLocales, defaultLocale, usePreferredLocale } from "@keybr/intl";
import { Pages } from "@keybr/pages-shared";
import { COLORS, FONTS, useTheme } from "@keybr/themes";
import {
  Dialog,
  ensureVisible,
  Icon,
  IconButton,
  type OptionListOption,
  Popover,
} from "@keybr/widget";
import {
  mdiArrowCollapseAll,
  mdiArrowExpandAll,
  mdiFormatFont,
  mdiThemeLightDark,
  mdiTranslate,
} from "@mdi/js";
import { clsx } from "clsx";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { defineMessage, useIntl } from "react-intl";
import { useLocation } from "react-router";
import * as styles from "./ThemeSwitcher.module.less";

const LazyThemeDesigner = lazy(() => import("./LazyThemeDesigner.tsx"));

export function ThemeSwitcher() {
  const { color, font, switchColor, switchFont } = useTheme();
  const [open, setOpen] = useState(
    null as "color" | "font" | "language" | null,
  );
  const [design, setDesign] = useState(false);
  const { pathname, search, hash } = useLocation();
  const preferredLocale = usePreferredLocale();
  return (
    <div className={styles.root}>
      {design && (
        <Dialog
          onClose={() => {
            setDesign(false);
          }}
        >
          <Suspense>
            <LazyThemeDesigner />
          </Suspense>
        </Dialog>
      )}
      <Popover
        open={open === "color"}
        anchor={
          <IconButton
            icon={<Icon shape={mdiThemeLightDark} />}
            onClick={() => {
              setOpen(open === "color" ? null : "color");
            }}
          />
        }
        offset={10}
      >
        <ColorMenu
          selectedId={color}
          onSelect={(id) => {
            setOpen(null);
            switchColor(id);
            if (id === "custom") {
              setDesign(true);
            }
          }}
        />
      </Popover>
      <Popover
        open={open === "font"}
        anchor={
          <IconButton
            icon={<Icon shape={mdiFormatFont} />}
            onClick={() => {
              setOpen(open === "font" ? null : "font");
            }}
          />
        }
        offset={10}
      >
        <FontMenu
          selectedId={font}
          onSelect={(id) => {
            setOpen(null);
            switchFont(id);
          }}
        />
      </Popover>
      <Popover
        open={open === "language"}
        anchor={
          <IconButton
            icon={<Icon shape={mdiTranslate} />}
            onClick={() => {
              setOpen(open === "language" ? null : "language");
            }}
          />
        }
        offset={10}
      >
        <LanguageMenu
          selectedId={preferredLocale}
          options={allLocales.map((locale) => ({
            value: locale,
            name: locale,
          }))}
          onSelect={(value) => {
            setOpen(null);
            const next = intlPathIncludingDefaultLocale(pathname, value);
            window.location.assign(`${next}${search}${hash}`);
          }}
        />
      </Popover>
      <span className={styles.fullscreen}>
        <FullscreenButton />
      </span>
    </div>
  );
}

function FullscreenButton() {
  const { formatMessage } = useIntl();
  const theme = useTheme();
  switch (theme.fullscreenState) {
    case true:
      return (
        <IconButton
          icon={<Icon shape={mdiArrowCollapseAll} />}
          title={formatMessage(
            defineMessage({
              id: "t_theme_Exit_fullscreen_",
              defaultMessage: "Exit full-screen mode.",
            }),
          )}
          onClick={() => {
            theme.toggleFullscreen();
          }}
        />
      );
    case false:
      return (
        <IconButton
          icon={<Icon shape={mdiArrowExpandAll} />}
          title={formatMessage(
            defineMessage({
              id: "t_theme_Enter_fullscreen_",
              defaultMessage: "Enter full-screen mode.",
            }),
          )}
          onClick={() => {
            theme.toggleFullscreen();
          }}
        />
      );
    default:
      return <IconButton icon={<Icon shape={mdiArrowExpandAll} />} />;
  }
}

function ColorMenu({
  selectedId,
  onSelect,
}: {
  readonly selectedId: string;
  readonly onSelect: (id: string) => void;
}) {
  const options = [...COLORS].map(({ id, name }) => ({ value: id, name }));
  const selected = options.find(({ value }) => value === selectedId);
  return (
    <Menu
      options={options}
      selectedOption={selected ?? options[0]}
      onSelect={({ value }) => {
        onSelect(value);
      }}
    />
  );
}

function FontMenu({
  selectedId,
  onSelect,
}: {
  readonly selectedId: string;
  readonly onSelect: (id: string) => void;
}) {
  const options = [...FONTS].map(({ id, name }) => ({ value: id, name }));
  const selected = options.find(({ value }) => value === selectedId);
  return (
    <Menu
      options={options}
      selectedOption={selected ?? options[0]}
      onSelect={({ value }) => {
        onSelect(value);
      }}
    />
  );
}

function LanguageMenu({
  selectedId,
  options,
  onSelect,
}: {
  readonly selectedId: string;
  readonly options: readonly OptionListOption[];
  readonly onSelect: (id: string) => void;
}) {
  const selected = options.find(({ value }) => value === selectedId);
  return (
    <Menu
      options={options}
      selectedOption={selected ?? options[0]}
      onSelect={({ value }) => {
        onSelect(value);
      }}
    />
  );
}

function Menu({
  options,
  selectedOption,
  onSelect,
}: {
  readonly options: readonly OptionListOption[];
  readonly selectedOption: OptionListOption;
  readonly onSelect: (value: OptionListOption) => void;
}) {
  const list = useRef(null);
  const item = useRef(null);
  useEffect(() => {
    ensureVisible(list.current, item.current);
  });
  return (
    <ul ref={list} role="menu" className={styles.menu}>
      {options.map((option, index) => (
        <li
          key={index}
          ref={option === selectedOption ? item : null}
          role="menuitem"
          className={clsx(
            styles.item,
            option === selectedOption && styles.item_selected,
          )}
          onClick={(event) => {
            event.preventDefault();
            onSelect(option);
          }}
        >
          {option.name}
        </li>
      ))}
    </ul>
  );
}

function intlPathIncludingDefaultLocale(path: string, locale: string): string {
  return locale === defaultLocale
    ? path === "/"
      ? `/${locale}`
      : `/${locale}${path}`
    : Pages.intlPath(path, locale);
}
