import { getSettings } from "lib/api";
// import { fonts } from "./fonts";

export function Styles({ settings }: { settings: any }) {
  // let requiredFonts: { style: { fontFamily: any } }[] = [];
  // for (var i in settings.fonts) {
  //   for (var k in fonts) {
  //     if (settings.fonts[i] === fonts[k].name)
  //       requiredFonts.push(fonts[k].font);
  //   }
  // }
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: `
      <style>
        :root {
          --color-primary: ${settings.primary_color};
          --color-secondary: ${settings.secondary_color};
          --color-tertiary: ${settings.tertiary_color};
          --color-quaternary: ${settings.quaternary_color};
          --default-text-color: ${settings.default_text_color};
          --font-primary: ${settings.fonts[0]};
          ${
            settings.fonts[1]
              ? "--font-secondary:" + settings.fonts[1]
              : "--font-secondary:" + settings.fonts[0]
          };
          ${settings.fonts[2] ? "--font-tertiary:" + settings.fonts[2] : ""};
          --h1-lg: ${settings.heading_sizes.h1_lg}px;
          --h1-lg-line-height: ${
            settings.heading_sizes.h1_lg_lineheight
              ? settings.heading_sizes.h1_lg_lineheight + "px"
              : "normal"
          };
          --h1-lg-font-weight: ${
            settings.heading_sizes.h1_lg_font_weight
              ? settings.heading_sizes.h1_lg_font_weight
              : "normal"
          };
          --h1-md: ${settings.heading_sizes.h1_md}px;
          --h1-md-line-height: ${
            settings.heading_sizes.h1_md_lineheight
              ? settings.heading_sizes.h1_md_lineheight + "px"
              : "normal"
          };
          --h1-md-font-weight: ${
            settings.heading_sizes.h1_md_font_weight
              ? settings.heading_sizes.h1_md_font_weight
              : "normal"
          };
          --h1-sm: ${settings.heading_sizes.h1_sm}px;
          --h1-sm-line-height: ${
            settings.heading_sizes.h1_sm_lineheight
              ? settings.heading_sizes.h1_sm_lineheight + "px"
              : "normal"
          };
          --h1-sm-font-weight: ${
            settings.heading_sizes.h1_sm_font_weight
              ? settings.heading_sizes.h1_sm_font_weight
              : "normal"
          };
          --h2-lg: ${settings.heading_sizes.h2_lg}px;
          --h2-lg-line-height: ${
            settings.heading_sizes.h2_lg_lineheight
              ? settings.heading_sizes.h2_lg_lineheight + "px"
              : "normal"
          };
          --h2-lg-font-weight: ${
            settings.heading_sizes.h2_lg_font_weight
              ? settings.heading_sizes.h2_lg_font_weight
              : "normal"
          };
          --h2-md: ${settings.heading_sizes.h2_md}px;
          --h2-md-line-height: ${
            settings.heading_sizes.h2_md_lineheight
              ? settings.heading_sizes.h2_md_lineheight + "px"
              : "normal"
          };
          --h2-md-font-weight: ${
            settings.heading_sizes.h2_md_font_weight
              ? settings.heading_sizes.h2_md_font_weight
              : "normal"
          };
          --h2-sm: ${settings.heading_sizes.h2_sm}px;
          --h2-sm-line-height: ${
            settings.heading_sizes.h2_sm_lineheight
              ? settings.heading_sizes.h2_sm_lineheight + "px"
              : "normal"
          };
          --h2-sm-font-weight: ${
            settings.heading_sizes.h2_sm_font_weight
              ? settings.heading_sizes.h2_sm_font_weight
              : "normal"
          };
          --h3-lg: ${settings.heading_sizes.h3_lg}px;
          --h3-lg-line-height: ${
            settings.heading_sizes.h3_lg_lineheight
              ? settings.heading_sizes.h3_lg_lineheight + "px"
              : "normal"
          };
          --h3-lg-font-weight: ${
            settings.heading_sizes.h3_md_font_weight
              ? settings.heading_sizes.h3_md_font_weight
              : "normal"
          };
          --h3-md: ${settings.heading_sizes.h3_md}px;
          --h3-md-line-height: ${
            settings.heading_sizes.h3_md_lineheight
              ? settings.heading_sizes.h3_md_lineheight + "px"
              : "normal"
          };
          --h3-md-font-weight: ${
            settings.heading_sizes.h3_sm_font_weight
              ? settings.heading_sizes.h3_sm_font_weight
              : "normal"
          };
          --h3-sm: ${settings.heading_sizes.h3_sm}px;
          --h3-sm-line-height: ${
            settings.heading_sizes.h3_sm_lineheight
              ? settings.heading_sizes.h3_sm_lineheight + "px"
              : "normal"
          };
          --h3-sm-font-weight: ${
            settings.heading_sizes.h3_sm_font_weight
              ? settings.heading_sizes.h3_sm_font_weight
              : "normal"
          };
          --h4-lg: ${settings.heading_sizes.h4_lg}px;
          --h4-lg-line-height: ${
            settings.heading_sizes.h4_lg_lineheight
              ? settings.heading_sizes.h4_lg_lineheight + "px"
              : "normal"
          };
          --h4-lg-font-weight: ${
            settings.heading_sizes.h4_lg_font_weight
              ? settings.heading_sizes.h4_lg_font_weight
              : "normal"
          };
          --h4-md: ${settings.heading_sizes.h4_md}px;
          --h4-md-line-height: ${
            settings.heading_sizes.h4_md_lineheight
              ? settings.heading_sizes.h4_md_lineheight + "px"
              : "normal"
          };
          --h4-md-font-weight: ${
            settings.heading_sizes.h4_md_font_weight
              ? settings.heading_sizes.h4_md_font_weight
              : "normal"
          };
          --h4-sm: ${settings.heading_sizes.h4_sm}px;
          --h4-sm-line-height: ${
            settings.heading_sizes.h4_sm_lineheight
              ? settings.heading_sizes.h4_sm_lineheight + "px"
              : "normal"
          };
          --h4-sm-font-weight: ${
            settings.heading_sizes.h4_sm_font_weight
              ? settings.heading_sizes.h4_sm_font_weight
              : "normal"
          };
          --h5-lg: ${settings.heading_sizes.h5_lg}px;
          --h5-lg-line-height: ${
            settings.heading_sizes.h5_lg_lineheight
              ? settings.heading_sizes.h5_lg_lineheight + "px"
              : "normal"
          };
          --h5-lg-font-weight: ${
            settings.heading_sizes.h5_lg_font_weight
              ? settings.heading_sizes.h5_lg_font_weight
              : "normal"
          };
          --h5-md: ${settings.heading_sizes.h5_md}px;
          --h5-md-line-height: ${
            settings.heading_sizes.h5_md_lineheight
              ? settings.heading_sizes.h5_md_lineheight + "px"
              : "normal"
          };
          --h5-md-font-weight: ${
            settings.heading_sizes.h5_md_font_weight
              ? settings.heading_sizes.h5_md_font_weight
              : "normal"
          };
          --h5-sm: ${settings.heading_sizes.h5_sm}px;
          --h5-sm-line-height: ${
            settings.heading_sizes.h5_sm_lineheight
              ? settings.heading_sizes.h5_sm_lineheight + "px"
              : "normal"
          };
          --h5-sm-font-weight: ${
            settings.heading_sizes.h5_sm_font_weight
              ? settings.heading_sizes.h5_sm_font_weight
              : "normal"
          };
          --h6-lg: ${settings.heading_sizes.h6_lg}px;
          --h6-lg-line-height: ${
            settings.heading_sizes.h6_lg_lineheight
              ? settings.heading_sizes.h6_lg_lineheight + "px"
              : "normal"
          };
          --h6-lg-font-weight: ${
            settings.heading_sizes.h6_lg_font_weight
              ? settings.heading_sizes.h6_lg_font_weight
              : "normal"
          };
          --h6-md: ${settings.heading_sizes.h6_md}px;
          --h6-md-line-height: ${
            settings.heading_sizes.h6_md_lineheight
              ? settings.heading_sizes.h6_md_lineheight + "px"
              : "normal"
          };
          --h6-md-font-weight: ${
            settings.heading_sizes.h6_md_font_weight
              ? settings.heading_sizes.h6_md_font_weight
              : "normal"
          };
          --h6-sm: ${settings.heading_sizes.h6_sm}px;
          --h6-sm-line-height: ${
            settings.heading_sizes.h6_sm_lineheight
              ? settings.heading_sizes.h6_sm_lineheight + "px"
              : "normal"
          };
          --h6-sm-font-weight: ${
            settings.heading_sizes.h6_sm_font_weight
              ? settings.heading_sizes.h6_sm_font_weight
              : "normal"
          };

          

          --header-bg-color: ${settings.header_config.header_bg_color};
          --header-border-bottom-color: ${
            settings.header_config.header_border_bottom_color
          };
          --header-border-bottom-width: ${
            settings.header_config.header_border_bottom_width
          }px;
          --header-text-color: ${settings.header_config.header_text_color};
          --header-text-hover-color: ${
            settings.header_config.header_text_hover_color
          };
          --header-position: ${settings.header_config.header_position};
          --header-width: ${settings.header_config.header_width}px;
          --header-mobile-hamburger-color: ${
            settings.header_config.header_mobile_menu.hamburger_color
          };
          --header-mobile-hamburger-close-color: ${
            settings.header_config.header_mobile_menu.hamburger_close_color
          };
          --container-width: ${settings.container_width}px;
          ${settings.buttons
            .map((button: any, index: number) => {
              return `--btn${index + 1}-bg-color: ${
                button.btn_bg_color ? button.btn_bg_color : "transparent"
              };
            --btn${index + 1}-text-color: ${
                button.btn_text_color ? button.btn_text_color : "transparent"
              };
            --btn${index + 1}-border-color: ${
                button.btn_border_color
                  ? button.btn_border_color
                  : "transparent"
              };
            --btn${index + 1}-hover-bg-color: ${
                button.btn_hover_bg_color
                  ? button.btn_hover_bg_color
                  : "transparent"
              };
            --btn${index + 1}-hover-text-color: ${
                button.btn_hover_text_color
                  ? button.btn_hover_text_color
                  : "transparent"
              };`;
            })
            .join("")}
          --btn-border-radius: ${settings.btn_border_radius}px;
          --btn-border-width: ${settings.btn_border_width}px;
          --btn-padding-x: ${settings.btn_padding_x}px;
          --btn-padding-y: ${settings.btn_padding_y}px;
          --btn-mobile-padding-x: ${settings.btn_mobile_padding_x}px;
          --btn-mobile-padding-y: ${settings.btn_mobile_padding_y}px;
          --btn-transition: ${settings.btn_transition};
          --border-radius-small: ${settings.border_radius_small}px;
          --border-radius-medium: ${settings.border_radius_medium}px;
          --border-radius-large: ${settings.border_radius_large}px;
          --border-radius-xlarge: ${settings.border_radius_xlarge}px;
          --cookie-notice-bg-color: ${settings.cookie_notice_bg_color};
        }
        body, a{
          color: var(--default-text-color);
          font-family: var(--font-primary);
        }
        .font-secondary,
        h1,
        h2,
        h3,
        h4,
        h5,
        .b2,
        .b4 {
          font-family: var(--font-secondary);
        }
        .font-tertiary {
          font-family: var(--font-tertiary);
        }
        .bg-primary, .has-primary-background-color {
          background-color: var(--color-primary);
        }
        .bg-secondary, .has-secondary-background-color {
          background-color: var(--color-secondary);
        }
        .bg-tertiary, .has-tertiary-background-color {
          background-color: var(--color-tertiary);
        }
        .bg-quaternary, .has-quaternary-background-color {
          background-color: var(--color-quaternary);
        }
        .text-primary, .has-primary-color {
          color: var(--color-primary);
        }
        .text-secondary, .has-secondary-color {
          color: var(--color-secondary);
        }
        .text-tertiary, .has-tertiary-color {
          color: var(--color-tertiary);
        }
        .text-quaternary , .has-quaternary-color {
          color: var(--color-quaternary);
        }

        /* Header border */
        ${
          settings.header_config.header_border_bottom_enabled
            ? "header nav {border-bottom: var(--header-border-bottom-width) solid var(--header-border-bottom-color);}"
            : ""
        }
        
        /* Header bg color */
        ${
          settings.header_config.header_bg_color
            ? "header .header-wrapper {background-color:var(--header-bg-color);}"
            : ""
        }

        /* Header text color */
        ${
          settings.header_config.header_text_color
            ? "header nav a{color:var(--header-text-color);} header .motiondiv{background-color:var(--header-text-hover-color);} .navul li.selected{color:var(--header-text-hover-color);}"
            : ""
        }
        /* Header text hover color */
        ${
          settings.header_config.header_text_hover_color
            ? "header nav a:hover{color:var(--header-text-hover-color);}"
            : "header nav a:hover{color: var(--bg-primary);}"
        } 


        /* Header width */
        ${
          settings.header_config.header_width &&
          "header nav, footer > div {max-width:var(--header-width);}"
        }

        /* Custom css */
        ${settings.custom_css ? settings.custom_css : ""}
        
        </style>`,
      }}
    />
  );
}
