import React, { useRef } from "react";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { format } from "date-fns";
import { useCollection } from "@/lib/hooks/useCollection";

const InvoiceDownload = ({ session }) => {
  const invoiceRef = useRef(null);
  const { data: session_snacks } = useCollection("session_snack", {
    filter: `session_id='${session.id}'`,
    expand: 'session_id,snack_id',
  });

  const handleDownloadPDF = async () => {
    const invoiceElement = invoiceRef.current;

    try {
      const canvas = await html2canvas(invoiceElement);
      const imgData = canvas.toDataURL('image/png');

      // Initialize PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`invoice-${session.expand.device_id.name}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  console.log("Session data:", session);
  if (!session) return null;

  return (
    <div className="flex flex-col items-center">
      <div ref={invoiceRef} className="bg-white p-5 border border-blue-500 rounded-md w-[350px] text-sm text-black">
        <h2 className="text-center font-bold text-xl text-blue-600">Game Ground</h2>
        <p className="text-center">Bill No: <b>{session.id.slice(0, 8)}</b> | Date: <b>{format(new Date(session.session_in), 'dd-MMM-yyyy')}</b></p>

        <hr className="my-2" />
        <h3 className="font-bold text-blue-600">Customer Details</h3>
        <p><b>Name:</b> {session.expand?.customer_id?.customer_name}</p>
        <p><b>Contact:</b> {session.expand?.customer_id?.customer_contact}</p>
        <p><b>Branch:</b> {session.expand?.branch_id?.name}</p>
        <p><b>Time:</b> {format(new Date(session.session_in), 'h:mm a')} - {session.session_out ? format(new Date(session.session_out), 'h:mm a') : 'Ongoing'}</p>

        <hr className="my-2" />
        <h3 className="font-bold text-blue-600">Session Details</h3>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left">Item</th>
              <th>Duration/Qty</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{session.expand?.game_id?.name || 'Gaming Session'}</td>
              <td className="text-center">{session.duration}hr</td>
              <td>₹{session.session_amount}</td>
            </tr>
            {session_snacks?.map((snackEntry, index) => (
              <tr key={index}>
                <td>{snackEntry.expand?.snack_id?.name}</td>
                <td className="text-center">{snackEntry.quantity}</td>
                <td>₹{snackEntry.expand?.snack_id?.price * snackEntry.quantity}</td>
              </tr>
            ))}
            {/*
              session.expand?.session_snacks?.map((snackEntry, index) => (
              <tr key={index}>
                <td>{snackEntry.expand?.snack_id?.name}</td>
                <td className="text-center">{snackEntry.quantity}</td>
                <td>₹{snackEntry.price || (snackEntry.expand?.snack_id?.price * snackEntry.quantity)}</td>
              </tr>
            ))
            */}
          </tbody>
        </table>

        <div className="mt-4">
          <p className="text-right font-bold">Base Amount: ₹{session.session_amount}</p>
          <p className="text-right font-bold">Snacks Total: ₹{session.snacks_total}</p>
          <hr className="my-2" />
          {session.discount_amount > 0 && (
            <p className="text-right font-bold">Discount: ₹{session.discount_amount}</p>
          )}
          <p className="text-right font-bold text-blue-600">Total Amount: ₹{session.total_amount}</p>
        </div>

        <hr className="my-2" />
        <h3 className="font-bold text-blue-600">Payment Details</h3>
        <p><b>Method:</b> {session.payment_mode}</p>
        {session.gg_points_earned > 0 && (
          <p><b>GG Points Earned:</b> {session.gg_points_earned}</p>
        )}
        {
          session.payment_mode === 'Part-paid' && (
            <>
              <p><b>Cash:</b> {session.Cash}</p>
              <p><b>Upi:</b> {session.Upi}</p>
              <p><b>Membership:</b> {session.MembershipPoints}</p>
            </>
          )
        }

        <hr className="my-2" />
        <p className="text-center text-xs">Thank you for visiting!<br />
          Contact: {session.expand?.branch_id?.contact_number || 'N/A'} | www.gameground.com
        </p>
      </div>

      <button
        onClick={handleDownloadPDF}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
      >
        Download Invoice as PDF
      </button>
    </div>
  );
};

export default InvoiceDownload;

