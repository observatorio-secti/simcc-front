import { useContext, useState } from "react";
import { UserContext } from "../../context/context";
export interface PesquisadorProps {
    lattes_id: string
    name: string
    type_: string
  }

export const fetchDataResearcherProgram = async (urlGeralAdm: string, id_program: string, setResearcher: React.Dispatch<React.SetStateAction<PesquisadorProps[]>>) => {
  const urlGetResearcher = `${urlGeralAdm}GraduateProgramResearcherRest/Query?graduate_program_id=${id_program}`;

  try {
    const response = await fetch(urlGetResearcher, {
      mode: "cors",
      method: 'GET',
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "3600",
        "Content-Type": "text/plain",
      },
    });
    const data = await response.json();
    if (data) {
      setResearcher(data);
    }
  } catch (err) {
    console.log(err);
  }
};

  