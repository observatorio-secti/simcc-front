import { useModalDashboard } from "../../hooks/use-modal-dashboard";
import { FirebaseTermsImport } from "./firebase-terms-import";

export function GeralViewMaster() {
    const { isOpen, type} = useModalDashboard();
  
    const isModalOpen = isOpen && type === "master";
    return (
        <>
        {isModalOpen && (
            <div>
            <FirebaseTermsImport/>
        </div>
        )}
        </>
    )
}