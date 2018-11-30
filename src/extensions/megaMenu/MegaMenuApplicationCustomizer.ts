import { override } from "@microsoft/decorators";
import { Log } from "@microsoft/sp-core-library";
import {
  BaseApplicationCustomizer,
  PlaceholderContent,
  PlaceholderName
} from "@microsoft/sp-application-base";
import { Dialog } from "@microsoft/sp-dialog";

import * as strings from "MegaMenuApplicationCustomizerStrings";

import styles from "./MegaMenu.module.scss";
import * as jQuery from "jquery";

const LOG_SOURCE: string = "MegaMenuApplicationCustomizer";

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IMegaMenuApplicationCustomizerProperties {
  // This is an example; replace with your own property
  testMessage: string;
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class MegaMenuApplicationCustomizer extends BaseApplicationCustomizer<
  IMegaMenuApplicationCustomizerProperties
> {
  private _topPlaceHolder: PlaceholderContent | undefined;
  private _topMenuItems = [
    { url: "#", name: "top 1", subItems: [{ url: "", name: "Sub 1" }] },
    {
      url: "#",
      name: "top 2",
      subItems: [
        {
          url: "",
          name: "Sub 1",
          subItems: [
            { url: "", name: "Sub 1" },
            { url: "", name: "Sub 2" },
            { url: "", name: "Sub 3" },
            { url: "", name: "Sub 4" }
          ]
        },
        {
          url: "",
          name: "Sub 2",
          subItems: [
            { url: "", name: "Sub 1" },
            { url: "", name: "Sub 2" },
            { url: "", name: "Sub 3" },
            { url: "", name: "Sub 4" }
          ]
        },
        { url: "", name: "Sub 3" },
        { url: "", name: "Sub 4" }
      ]
    },
    { url: "#", name: "top 3", subItems: [{ url: "", name: "Sub 1" }] },
    { url: "#", name: "top 4", subItems: [{ url: "", name: "Sub 1" }] },
    {
      url: "#",
      name: "top 5",
      subItems: [{ url: "", name: "Sub 1" }, { url: "", name: "Sub 2" }]
    }
  ];

  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);
    debugger;
    this.context.placeholderProvider.changedEvent.add(
      this,
      this._renderPlaceHolders
    );

    //Generate Mega Menu HTML
    let menuString: string = this.generateMegaMenuLevel(this._topMenuItems);

    //Set HTML
    jQuery("#menu ul").html(menuString);

    this._renderPlaceHolders();

    jQuery("#menu > ul > li:has( > ul)").addClass(`${styles.menuDropdownIcon}`);
    //Checks if li has sub (ul) and adds class for toggle icon - just an UI

    jQuery("#menu > ul > li > ul:not(:has(ul))").addClass(
      `${styles.normalSub}`
    );
    //Checks if drodown menu's li elements have anothere level (ul), if not the dropdown is shown as regular dropdown, not a mega menu (thanks Luka Kladaric)

    jQuery("#menu > ul").before(
      `<a href="#" class="${styles.menuMobile}" id="menuMobile">Navigation</a>`
    );

    //Adds menu-mobile class (for mobile toggle menu) before the normal menu
    //Mobile menu is hidden if width is more then 959px, but normal menu is displayed
    //Normal menu is hidden if width is below 959px, and jquery adds mobile menu
    //Done this way so it can be used with wordpress without any trouble

    //Make sure that menu is hidden when resizing the window to desktop
    jQuery(window).resize(function() {
      if (jQuery(window).width() > 943) {
        jQuery("#menu > ul > li")
          .children("ul")
          .hide();
      }
    });

    jQuery("#menu > ul > li").hover(function(e) {
      if (jQuery(window).width() > 943) {
        jQuery(this)
          .children("ul")
          .stop(true, false)
          .fadeToggle(150);
        e.preventDefault();
      }
    });
    //If width is more than 943px dropdowns are displayed on hover

    jQuery("#menu > ul > li").click(function() {
      if (jQuery(window).width() <= 943) {
        jQuery(this)
          .children("ul")
          .fadeToggle(150);
      }
    });
    //If width is less or equal to 943px dropdowns are displayed on click (thanks Aman Jain from stackoverflow)

    //window.showOnMobileClass = `${styles.showOnMobile}`;
    jQuery("#menuMobile").click(function(e) {
      jQuery("#menu > ul").toggleClass(`${styles.showOnMobile}`);
      e.preventDefault();
    });
    return Promise.resolve();
  }

  private generateMegaMenuLevel(levels): string {
    let menuString: string = "";

    for (let i: number = 0; i < levels.length; i++) {
      let levelItem = levels[i];
      let url: string = levelItem.url;
      menuString += '<li><a href="' + url + '">' + levelItem.name + "</a>";
      if (levelItem.subItems && levelItem.subItems.length != 0) {
        menuString += "<ul>";
        menuString += this.generateMegaMenuLevel(levelItem.subItems);
        menuString += "</ul>";
      }
      menuString += "</li>";
    }

    return menuString;
  }

  private _renderPlaceHolders(): void {
    console.log("HelloWorldApplicationCustomizer._renderPlaceHolders()");
    console.log(
      "Available placeholders: ",
      this.context.placeholderProvider.placeholderNames
        .map((name) => PlaceholderName[name])
        .join(", ")
    );
    console.log(this.context.placeholderProvider);
    // Handling the top placeholder
    if (!this._topPlaceHolder) {
      this._topPlaceHolder = this.context.placeholderProvider.tryCreateContent(
        PlaceholderName.Top,
        { onDispose: this._onDispose }
      );

      // The extension should not assume that the expected placeholder is available.
      if (!this._topPlaceHolder) {
        console.error("The expected placeholder (Top) was not found.");
        return;
      }

      if (this.properties) {
        if (this._topPlaceHolder.domElement) {
          this._topPlaceHolder.domElement.innerHTML = `
                <div class="${styles.app}">
                  <div class="${styles.menuContainer}">
                    <div class="${styles.menu}" id="menu"><ul></ul></div>
                  </div>
                </div>`;
        }
      }
    }
  }

  private _onDispose(): void {
    console.log(
      "[HelloWorldApplicationCustomizer._onDispose] Disposed custom top and bottom placeholders."
    );
  }
}
