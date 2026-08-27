import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getUserById } from "@/services/userService";
import { getUserBooking } from "@/services/bookingApi";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import user from "../../assets/user.png";
import { Config } from "@/lib/Config";
import { CheckCircle, XCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function UserDetails() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { t } = useLanguage();
    const [userDetails, setUserDetails] = useState(null);
    const [bookingDetails, setBookingDetails] = useState(null);
    const [activeTab, setActiveTab] = useState("personal"); // 👈 active tab state

    useEffect(() => {
        if (id) {
            getUserById(id).then((data) => setUserDetails(data));
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            getUserBooking(id).then((data) => setBookingDetails(data));
        }
    }, [id]);

    if (!userDetails) return <div className="text-center py-10">{t("loading")}</div>;

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-12 gap-4">
                {/* Left Sidebar */}
                <div className="col-span-4 space-y-4">
                    <Card className="shadow-xl">
                        <CardHeader className="flex flex-col items-center text-center gap-4">
                            <img
                                className="w-24 h-24 rounded-full object-cover flex-none"
                                src={`${Config.API_URL}${userDetails.image}`}
                                alt={`${userDetails.firstname} ${t("profile")}`}
                                onError={({ currentTarget }) => {
                                    currentTarget.onerror = null;
                                    currentTarget.src = user;
                                }}
                            />

                            <div>
                                <CardTitle className="text-2xl font-bold">
                                    {userDetails.firstname} {userDetails.lastname}
                                </CardTitle>
                                <div className="flex flex-wrap gap-2 justify-center mt-4">
                                    {userDetails.isAdmin && <Badge variant="destructive">{t("admin")}</Badge>}
                                    {userDetails.isVerified && <Badge variant="default">{t("verified")}</Badge>}
                                    {userDetails.isActive ? (
                                        <Badge variant="success">{t("active")}</Badge>
                                    ) : (
                                        <Badge variant="secondary">{t("inactive")}</Badge>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                    </Card>

                    {/* Custom Toggle Buttons */}
                    <Card className="shadow-xl">
                        <CardContent className="flex flex-col gap-2 p-4">
                            <Button
                                variant={activeTab === "personal" ? "default" : "ghost"}
                                onClick={() => setActiveTab("personal")}
                                className="w-full justify-start"
                            >
                                {t("personalInfo")}
                            </Button>
                            <Button
                                variant={activeTab === "bookings" ? "default" : "ghost"}
                                onClick={() => setActiveTab("bookings")}
                                className="w-full justify-start"
                            >
                                {t("bookingDetails")}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Content */}
                <div className="col-span-8">
                    {activeTab === "personal" && (
                        <Card>
                            <div className="flex justify-between mx-5">
                                <div className="text-3xl">{t("userInformation")}</div>
                                <Button onClick={() => navigate(-1)} variant="outline">
                                    {t("back")}
                                </Button>
                            </div>

                            <CardContent className="grid gap-4 pt-4">
                                {[
                                    { label: t("email"), value: userDetails.email },
                                    { label: t("phoneLabel"), value: userDetails.phoneNumber },
                                    { label: t("gender"), value: userDetails.gender },
                                    { label: t("age"), value: userDetails.age },
                                    {
                                        label: t("createdAt"),
                                        value: format(new Date(userDetails.createdAt), "dd MMM yyyy, hh:mm a"),
                                    },
                                    {
                                        label: t("updatedAt"),
                                        value: format(new Date(userDetails.updatedAt), "dd MMM yyyy, hh:mm a"),
                                    },
                                ].map((item) => (
                                    <div
                                        key={item.label}
                                        className="grid grid-cols-3 gap-4 items-center"
                                    >
                                        <p className="text-muted-foreground font-medium">{item.label}</p>
                                        <p className="col-span-2">{item.value || "-"}</p>
                                    </div>
                                ))}

                                <div className="pt-6 flex justify-center">
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === "bookings" && (
                        <Card>
                            <div className="flex justify-between mx-5">
                                <div className="text-3xl">{t("userBookingDetails")}</div>
                                <Button onClick={() => navigate(-1)} variant="outline">
                                    {t("back")}
                                </Button>
                            </div>
                            <CardContent className="pt-4">
                                {bookingDetails && bookingDetails.length > 0 ? (
                                    <div className="space-y-4">
                                        {bookingDetails.map((booking) => (
                                            <Card key={booking._id} className="shadow-md border">
                                                <div className="flex flex-col md:flex-row gap-4 p-4">
                                                    {/* Booking Info */}
                                                    <div className="flex-1 space-y-2">
                                                        <div className="flex justify-between items-center flex-wrap gap-2">
                                                            <h3 className="text-lg font-semibold">{`${t("bookingId")}: ${booking.orderNo}`}</h3>
                                                            <div className="flex gap-2 items-center">
                                                                <Badge variant={booking.status === "confirmed" ? "success" : "secondary"}>
                                                                    {booking.status}
                                                                </Badge>
                                                                <Badge variant={booking.isPaid ? "success" : "destructive"}>
                                                                    {booking.isPaid ? <CheckCircle className="w-4 h-4 mr-1 inline" /> : <XCircle className="w-4 h-4 mr-1 inline" />}
                                                                    {booking.isPaid ? t("paid") : t("unpaid")}
                                                                </Badge>
                                                            </div>
                                                        </div>

                                                        <div className="text-sm grid gap-1">
                                                            <p>
                                                                <span className="font-medium text-muted-foreground">{t("pickup")}:</span>{" "}
                                                                {booking.pickupLocation.apartment}, {booking.pickupLocation.pincode}
                                                            </p>
                                                            <p>
                                                                <span className="font-medium text-muted-foreground">{t("dropoff")}:</span>{" "}
                                                                {booking.dropoffLocation.apartment}, {booking.dropoffLocation.pincode}
                                                            </p>
                                                            <p>
                                                                <span className="font-medium text-muted-foreground">{t("pickupTime")}:</span>{" "}
                                                                {format(new Date(booking.pickupDateTime), "dd MMM yyyy, hh:mm a")}
                                                            </p>
                                                            <p>
                                                                <span className="font-medium text-muted-foreground">{t("dropoffTime")}:</span>{" "}
                                                                {format(new Date(booking.dropoffDateTime), "dd MMM yyyy, hh:mm a")}
                                                            </p>
                                                            <p>
                                                                <span className="font-medium text-muted-foreground">{t("created")}:</span>{" "}
                                                                {format(new Date(booking.createdAt), "dd MMM yyyy, hh:mm a")}
                                                            </p>
                                                        </div>

                                                        <div className="pt-2">
                                                            <span className="font-medium text-muted-foreground">{t("services")}:</span>
                                                            <ul className="list-disc list-inside text-sm">
                                                                {booking.services.map((s, idx) => (
                                                                    <li key={idx}>
                                                                        {s.title} — ${s.price} × {s.qty}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                        <div className="pt-4 flex justify-end">
                                                            <Button onClick={() => navigate(`/booking/${booking._id}`)} size="sm">
                                                                {t("viewDetails")}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center text-muted-foreground py-10">
                                        {t("noBookings")}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
