import { useWriteContract } from "wagmi";
import { bookingAbi, bookingAddress } from "@/constants";
import { toast } from "sonner";
import AddReviewModal from "./AddReviewModal";
import React, { useState } from 'react';
import DateRangePicker from '@wojtekmaj/react-daterange-picker';
import '@wojtekmaj/react-daterange-picker/dist/DateRangePicker.css';
import 'react-calendar/dist/Calendar.css';
import { exit } from "process";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface RoomCardProps {
  room: any;
}

const RoomCard: React.FC<RoomCardProps> = ({ room }) => {
  const { data: hash, isPending, writeContractAsync } = useWriteContract();

  const [value, onChange] = useState<Value>([new Date(), new Date()]);

  const getImageByCategory = (category: string) => {
    switch (category) {
      case "Presidential":
        return "/2071.jpg";
      case "Deluxe":
        return "/2149.jpg";
      case "Suite":
        return "/7715.jpg";
      default:
        return "/7715.jpg";
    }
  };

  const getCategoryLabel = (category: number) => {
    switch (category) {
      case 0:
        return "Presidential";
      case 1:
        return "Deluxe";
      case 2:
        return "Suite";
      default:
        return "";
    }
  };

  const handleBookRoom = async () => {
    let today = new Date();
    today.setHours(0,0,0,0);
    let timezoneOffset = today.getTimezoneOffset();

    let start = value![0];
    start.setHours(0,0,0,0);
    let end = value![1];
    end.setHours(0,0,0,0);

    if (today > start || today > end || start >= end) {
        alert("Invalid date range");
        return;
    }

    // days since epoch
    let s = (start.getTime() - timezoneOffset*60*1000) / 1000 / 3600 / 24;
    let e = (end.getTime() - timezoneOffset*60*1000) / 1000 / 3600 / 24;

    try {
      const bookRoomTx = await writeContractAsync({
        abi: bookingAbi,
        address: bookingAddress,
        functionName: "bookRoomByCategory",
        args: [room.category, s, e],
      });

      console.log("room booking hash:", bookRoomTx);
    } catch (err: any) {
      toast.error("Transaction Failed: " + err.message);
    }
  };

  return (
    <div className="border p-4 m-4">
      <img
        src={getImageByCategory(getCategoryLabel(room.category))}
        alt="Room"
        className="w-full h-56 object-cover mb-4"
      />

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-3xl font-bold">
            {getCategoryLabel(room.category)}
          </h3>
          <p className="text-md">
            Price per Night: {room.pricePerNight?.toString()}
          </p>
          <p className="text-sm">
            Availability: {room.isAvailable ? "Available" : "Unavailable"}
          </p>
        </div>

        <div className="flex" style={{padding: '25px 0 0 0'}}>
          <div style={{display: 'block'}}>
            <div style={{padding: '2px 0 0 0'}}>
              <label>Check-In/Out:</label>
            </div>
          </div>
          <div style={{display: 'block'}}>
            <DateRangePicker onChange={onChange} value={value} />
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold mt-2">Reviews:</h4>
          {room.reviews?.length > 0 ? (
            room.reviews.map((review: any, index: any) => (
              <div className="text-sm" key={index}>
                <p className="">
                  {review.comment} - {review.rating} stars
                </p>
              </div>
            ))
          ) : (
            <p>No reviews yet.</p>
          )}

          <div className="flex gap-3">
            {room.isAvailable && (
              <button
                onClick={handleBookRoom}
                disabled={isPending}
                className="bg-green-600 text-white p-2 mt-2"
              >
                {isPending ? "Loading" : "Book Room"}
              </button>
            )}

            <AddReviewModal>
              <button className="bg-gray-600 text-white p-2 mt-2">
                Add Review
              </button>
            </AddReviewModal>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
