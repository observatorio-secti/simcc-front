import { useContext } from "react";
import Masonry, {ResponsiveMasonry} from "react-responsive-masonry"
import { useModalSidebar } from "../../../hooks/use-modal-sidebar";
import { UserContext } from "../../../../context/context";
import { InstitutionsItem } from "./institutions-item";

type Institutions = {
    institutions: any[];
}

export function InstitutionsBlock(props: Institutions) {
    const {navbar} = useContext(UserContext)
    const {isOpen} = useModalSidebar()
    return(
        <div>
             <ResponsiveMasonry
    columnsCountBreakPoints={{
        350: 1,
        750: 2,
        900: 3,
        1200: navbar || isOpen ? 3 : 4
    }}
>
                 <Masonry gutter="16px">
                 {props.institutions.map((props: any) => {
                    return(
                        <InstitutionsItem
                        among={props.among}
                        id={props.id}
                        image={props.image}
                        institution={props.institution}
                        />
                    )
                 })}
                 </Masonry>
        </ResponsiveMasonry>
        </div>
    )
}