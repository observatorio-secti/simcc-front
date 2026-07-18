
import img_2 from '../../assets/logo_email_2.png';
import img_1 from '../../assets/logo_email_4.png';
import img_4 from '../../assets/logo_email_3.png';


export function FooterHome() {
    return(
        <div className="bg-neutral-100 justify-center items-center flex-col dark:bg-neutral-800 flex gap-6 p-8 rounded-md mb-8">
 <div className='flex gap-6'>
 <img src={img_4} className="h-12" alt="Logo" />
 <img src={img_2} className="h-12" alt="Logo" />
 <img src={img_1} className="h-12" alt="Logo" />
 </div>

          
        </div>
    )
}