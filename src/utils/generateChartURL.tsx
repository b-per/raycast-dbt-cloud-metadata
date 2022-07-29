import { environment } from "@raycast/api";

export function generateChartURL(
  dataSeries: Array<Array<number>>,
  dataLabels: Array<string>,
  title: string,
  legend: Array<string>
) {
  const base_url = "https://image-charts.com/chart?";
  // for handling dark mode
  const colorLabel: string = environment.theme == "dark" ? "FFFFFF" : "000000";

  const params = [
    `chd=t:` + `${dataSeries.map((e) => e.join(",")).join("|")}`,
    `chco=FF6849,195050,262A38,F1F1F1`, // color for the different data
    `chxt=x,y`, // axis types
    `chxl=0:|` + dataLabels.join("|"), // x axis values
    `cht=bvs`, // chart tybe, bar chart
    `chs=700x450`, // size
    `chxs=0,${colorLabel},min40|1,${colorLabel}`, // rotation of the labels for the x axis and color
    `chdl=${legend.join("|")}`, // label names
    `chdls=${colorLabel}`, // label style
    `chf=a,s,00000000`, // transparent background
    `chtt=${title}`, // title name
    `chts=${colorLabel},20`, //title style
  ];

  const params_url = params.join("&");
  const full_url = encodeURI(base_url + params_url);

  return full_url;
}
