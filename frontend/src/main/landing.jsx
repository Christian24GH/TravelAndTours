import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import CardImage from "@/components/core1/card-image"
import logo from '@/assets/finallogo.avif'
import React from 'react';
import { Link } from 'react-router';
export default function LandingPage() {
    const wallpaperHeader = "./src/assets/wallpaper-header.jpg"
    const featuredImg1 = "./src/assets/Bohol.jpg";
    const featuredImg2 = "./src/assets/Boracay.jpg";
    const featuredImg3 = "./src/assets/Palawan.jpg";

    return(
        <>
            <div className="flex items-center py-2 px-4 justify-evenly">
                <div className="flex items-center">
                    <img src={logo} className="w-30" alt="Logo"/>
                    <h1 className="text-(--primary) text-[20px] font-bold">Travel & Tours</h1>
                </div>

                <div className="flex items-center gap-20">
                    <a href="#destinations">Destination</a>
                    <a href="#">Why Us</a>
                    <a href="#">Packages</a>
                    <a href="#">Reviews</a>
                    <a href="#">Faq</a>
                </div>

                <div className="flex items-center gap-4">
                    <Button>Contact</Button>
                    <Button variant="outline">Get a Quote</Button>
                </div>
            </div>

            <div className="py-60 relative overflow-hidden">
                <img src={wallpaperHeader} alt="wallpaper" className="blur-[5px] absolute bottom-0 w-[100%] h-[100%] z-0"/>
                <div className="ml-20 p-8 rounded-lg bg-white w-150 z-10">
                    <b><h1 className="text-[30px]">Design your next Escape with
                        <p className="text-(--primary) text-[50px]">Travel And Tours</p>
                        </h1>
                    </b>
                    <p className="my-4">Curated itineraries, reliable transfer, and local-guided experiences <br />
                    across the philippines and beyond.</p>

                    <Button className="block">Find Packages</Button>
                </div>
            </div>

            <div className="flex items-center py-4 justify-evenly">
                <div>
                    <p className="text-center text-(--vivid-neon-pink) font-bold text-[20px]">50k+</p>
                    <p className="text-center font-bold text-[13px]">Happy Travelers</p>
                </div>

                <div>
                    <p className="text-center text-(--vivid-neon-pink) font-bold text-[20px]">4.9</p>
                    <p className="text-center font-bold text-[13px]">Average Rating</p>
                </div>

                <div>
                    <p className="text-center text-(--vivid-neon-pink) font-bold text-[20px]">200+</p>
                    <p className="text-center font-bold text-[13px]">Local Partners</p>
                </div>

                <div>
                    <p className="text-center text-(--vivid-neon-pink) font-bold text-[20px]">12yrs</p>
                    <p className="text-center font-bold text-[13px]">Experience</p>
                </div>
            </div>

            <Separator />

            <div className="py-20 px-80" id="destinations">
                <div className="flex items-center justify-between">
                    <h1 className="text-[20px] font-bold">Destinations</h1>
                    <a href="#" className="text-(--primary) text-[20px] font-bold">See all Packages</a>
                </div>

                <div className="flex items-center mt-4 justify-between">
                    <CardImage src={featuredImg1} name="Bohol" desc="Chocolate Hills Tarsiers"/>
                    <CardImage src={featuredImg2} name="Boracay" desc="White Beach Water Sports"/>
                    <CardImage src={featuredImg3} name="Palawan" desc="Lagoon Hoping Limestone Cliffs"/>
                </div>
            </div>

            <div className="py-8 px-20 bg-[#e9efff]">
                <h1 className="text-center text-[30px] mb-8 font-bold">Traveler Reviews</h1>

                <div className="flex items-center justify-evenly">
                    <div className="p-4 rounded-md bg-(--primary) w-80">
                        <p className="text-white">Flawless Palawan trip! Transfer were on time and tours felt truly local</p>
                        <p className="mt-2 text-white">- Mika p.</p>
                    </div>

                    <div className="p-4 rounded-md bg-(--primary) w-80">
                        <p className="text-white">They customize our Cebu itinerary around our kids-super helpful support</p>
                        <p className="mt-2 text-white">- Arvin p.</p>
                    </div>

                    <div className="p-4 rounded-md bg-(--primary) w-80">
                        <p className="text-white">Great value for money. We loved the Coron shipwreck tour!</p>
                        <p className="mt-2 text-white">- Jessa L.</p>
                    </div>

                    <div className="p-4 rounded-md bg-(--primary) w-80">
                        <p className="text-white">Quick to respond and very organized. Will book again.</p>
                        <p className="mt-2 text-white">- Leo S.</p>
                    </div>
                </div>
            </div>

            <div className="flex items-center py-8 flex-col">
                <h1 className="text-center font-bold text-2xl mb-8">Frequently asked questions</h1>

                <div className="flex items-center flex-col rounded-xl border w-[40%]">
                    <div className="p-8 border-b w-[100%]">
                        <p className="font-bold mb-8">What's included in a typical package?</p>
                        <p>Most include accomodations, daily breakfast, tours with local guides, entrance fees, and transfer. Flights can bundled request</p>
                    </div>

                    <div className="p-8 border-b w-[100%]">
                        <p className="font-bold mb-8">Can I customize my itinerary?</p>
                        <p>Absolutely. Tell us your dates, budget, and must-see spots and we'll tailor the trip</p>
                    </div>

                    <div className="p-8 border-b w-[100%]">
                        <p className="font-bold mb-8">What is your cancellation policy?</p>
                        <p>Free reschedules up to 7 days befores arrival for most packages. Full policy varies partner and season</p>
                    </div>
                </div>
            </div>

            <div className="py-8 px-20 bg-[#dd06c427]">
                <h1 className="text-center text-[30px] font-bold">Ready to start Planning?</h1>
                <p className="text-center">Get a personalized quote in minutes. No commitment.</p>

                <div className="flex items-center justify-center mt-8">
                    <Button className="bg-[#dd06c5]">Request a quote</Button>
                </div>
            </div>

            <div className="flex justify-center p-8 gap-8">
                <div>
                    <h1 className="font-bold text-2xl">Contact Us</h1>
                    <p>Tell us your dream trip and we'll handle the rest.</p>
                </div>

                <div className="px-8 py-2 shadow-xl rounded-md">
                    <input type="text" className="border rounded-xl p-4 w-90 my-2" placeholder="Full Name"/><br />
                    <input type="text" className="border rounded-xl p-4 w-90 my-2" placeholder="Email"/><br />
                    <input type="text" className="border rounded-xl p-4 w-90 my-2" placeholder="Destination (e.g., Cebu, Bohol)"/><br />
                    <textarea className="border rounded-xl p-4 w-90 h-90 resize-none my-2" placeholder="Tell us about your trip"/><br />

                    <input type="submit" className="border rounded-xl p-4 w-90 my-2 text-white bg-[#dd06c5]" placeholder="Send Inquiry"/>
                </div>
            </div>

            <Separator/>

            <div className="flex items-center justify-evenly p-8">
                <div>
                    <img src={logo} className="w-60 ml-[-40px]" alt="Logo"/>
                    <h1 className="font-bold text-(--primary)">Travel and Tours</h1>
                </div>

                <div>
                    <h1 className="font-bold">Explore</h1>
                    <p>Destinations</p>
                    <p>Packages</p>
                    <p>Reviews</p>
                </div>

                <div>
                    <h1 className="font-bold">Company</h1>
                    <p>About</p>
                    <p>FAQ</p>
                    <p>Contact</p>
                </div>
            </div>
        </>
    )
}