import { ColumnDef } from "@tanstack/react-table";


//import { UserContext } from "../../../../context/context"

export type Institutions = {
  among: string;
  id: string;
  image: string;
  institution: string;
};

export const columns: ColumnDef<Institutions>[] = [
  {
    accessorKey: "institution",
    header: "Instituição",
  },
  {
    accessorKey: "among",
    header: "Nº Ocorrências",
  }

 
];
