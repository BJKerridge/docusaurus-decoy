// systemsData.ts
// Static map layout only — live sovereignty data (indices, alliance, vulnerability windows)
// is fetched at runtime in useSovereignty.ts and merged by solar_system_id.

export type System = {
    solar_system_id: string;
    system: string;
    region: string;
    clusterId: string;
    links: string[];
    x: number;
    y: number;
  };
  
  export const CLUSTERS = [
    { id: "delve",       label: "Delve" },
    { id: "querious",    label: "Querious" },
  ];
  
  export const systems: System[] = [
    {
      solar_system_id: "30004722",
      system: "319-3D",
      region: "Delve",
      clusterId: "delve",
      x: 400,
      y: 100,
      links: ["D-3GIQ"],
    },
    {
      solar_system_id: "30004750",
      system: "D-3GIQ",
      region: "Delve",
      clusterId: "delve",
      x: 400,
      y: 250,
      links: ["K-6K16", "319-3D"],
    },
    {
      solar_system_id: "30004751",
      system: "K-6K16",
      region: "Delve",
      clusterId: "delve",
      x: 400,
      y: 400,
      links: ["F-TE1T", "QY6-RK", "W-KQPI", "D-3GIQ"],
    },
    {
      solar_system_id: "30004757",
      system: "F-TE1T",
      region: "Delve",
      clusterId: "delve",
      x: 200,
      y: 400,
      links: ["K-6K16", "J-LPX7"],
    },
    {
      solar_system_id: "30004752",
      system: "QY6-RK",
      region: "Delve",
      clusterId: "delve",
      x: 400,
      y: 550,
      links: ["K-6K16", "J-LPX7"],
    },
    {
      solar_system_id: "30004755",
      system: "J-LPX7",
      region: "Delve",
      clusterId: "delve",
      x: 200,
      y: 550,
      links: ["F-TE1T", "QY6-RK"],
    },
    {
      solar_system_id: "30004753",
      system: "W-KQPI",
      region: "Delve",
      clusterId: "delve",
      x: 600,
      y: 400,
      links: ["K-6K16", "PUIG-F"],
    },
    {
      solar_system_id: "30004754",
      system: "PUIG-F",
      region: "Delve",
      clusterId: "delve",
      x: 800,
      y: 400,
      links: ["W-KQPI", "0-HDC8"],
    },
    {
      solar_system_id: "30004756",
      system: "0-HDC8",
      region: "Delve",
      clusterId: "delve",
      x: 800,
      y: 250,
      links: ["PUIG-F", "SVM-3K"],
    },
    {
      solar_system_id: "30004758",
      system: "SVM-3K",
      region: "Delve",
      clusterId: "delve",
      x: 800,
      y: 100,
      links: ["0-HDC8", "8QT-H4"],
    },
    {
      solar_system_id: "30004012",
      system: "8QT-H4",
      region: "Querious",
      clusterId: "delve",
      x: 1000,
      y: 100,
      links: ["SVM-3K"],
    },
    {
      solar_system_id: "30003948",
      system: "7GCD-P",
      region: "Querious",
      clusterId: "querious",
      x: 200,
      y: 250,
      links: ["0-WT2D"],
    },
    {
      solar_system_id: "30003947",
      system: "0-WT2D",
      region: "Querious",
      clusterId: "querious",
      x: 400,
      y: 250,
      links: ["7GCD-P", "7V-KHW"],
    },
    {
      solar_system_id: "30003945",
      system: "7V-KHW",
      region: "Querious",
      clusterId: "querious",
      x: 600,
      y: 250,
      links: ["0-WT2D", "T8H-66"],
    },
    {
      solar_system_id: "30003943",
      system: "T8H-66",
      region: "Querious",
      clusterId: "querious",
      x: 800,
      y: 250,
      links: ["7V-KHW", "03L-95", "A3-LOG", "A2-V27"],
    },
    {
      solar_system_id: "30003946",
      system: "O3L-95",
      region: "Querious",
      clusterId: "querious",
      x: 1000,
      y: 250,
      links: ["T8H-66", "A2-V27"],
    },
    {
      solar_system_id: "30003944",
      system: "A3-LOG",
      region: "Querious",
      clusterId: "querious",
      x: 800,
      y: 400,
      links: ["T8H-66", "A2-V27"],
    },
    {
      solar_system_id: "30003942",
      system: "A2-V27",
      region: "Querious",
      clusterId: "querious",
      x: 1000,
      y: 400,
      links: ["T8H-66", "03L-95", "A3-LOG", "Kaira"],
    },
    {
      solar_system_id: "30003887",
      system: "Kaira",
      region: "Khanid",
      clusterId: "querious",
      x: 1100,
      y: 475,
      links: ["A2-V27"],
    },
  ];