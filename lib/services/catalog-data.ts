// Auto-generated from the service catalog seed migration data.
// Single source of truth for the 258-service Nigerian market catalog —
// consumed by app/api/admin/services/seed/route.ts to seed the database
// directly through the app (service-role client), so this never requires
// running SQL by hand.

export interface CatalogService {
  name: string;
  min: number;
  max: number;
}

export interface CatalogSubcategory {
  slug: string;
  name: string;
  services: CatalogService[];
}

export interface CatalogCategory {
  slug: string;
  name: string;
  iconKey: string;
  subcategories: CatalogSubcategory[];
}

export const SERVICE_CATALOG: CatalogCategory[] = [
  {
    "slug": "home-services",
    "name": "Home Services",
    "iconKey": "cleaning",
    "subcategories": [
      {
        "slug": "home-services-house-cleaning",
        "name": "House Cleaning",
        "services": [
          {
            "name": "Standard House Cleaning",
            "min": 5000,
            "max": 9000
          },
          {
            "name": "Deep Cleaning",
            "min": 8000,
            "max": 15000
          },
          {
            "name": "Move-in Cleaning",
            "min": 10000,
            "max": 20000
          },
          {
            "name": "Move-out Cleaning",
            "min": 10000,
            "max": 20000
          },
          {
            "name": "Bathroom Cleaning",
            "min": 3500,
            "max": 6000
          },
          {
            "name": "Kitchen Cleaning",
            "min": 4000,
            "max": 7500
          },
          {
            "name": "Window Cleaning",
            "min": 3000,
            "max": 8000
          },
          {
            "name": "Sofa Cleaning",
            "min": 4000,
            "max": 10000
          },
          {
            "name": "Carpet Cleaning",
            "min": 4500,
            "max": 12000
          },
          {
            "name": "Mattress Cleaning",
            "min": 4000,
            "max": 9000
          },
          {
            "name": "Post-Construction Cleaning",
            "min": 15000,
            "max": 40000
          },
          {
            "name": "Office Cleaning",
            "min": 8000,
            "max": 25000
          },
          {
            "name": "Fumigation & Pest Spray Cleanup",
            "min": 6000,
            "max": 15000
          },
          {
            "name": "Refrigerator Deep Clean",
            "min": 3000,
            "max": 6000
          },
          {
            "name": "Oven Cleaning",
            "min": 3500,
            "max": 7000
          }
        ]
      },
      {
        "slug": "home-services-laundry",
        "name": "Laundry & Ironing",
        "services": [
          {
            "name": "Laundry (Wash & Fold)",
            "min": 2500,
            "max": 6000
          },
          {
            "name": "Laundry (Wash & Iron)",
            "min": 3500,
            "max": 8000
          },
          {
            "name": "Ironing Only",
            "min": 2000,
            "max": 5000
          },
          {
            "name": "Dry Cleaning Pickup & Drop-off",
            "min": 3000,
            "max": 9000
          },
          {
            "name": "Curtain Laundry",
            "min": 4000,
            "max": 10000
          },
          {
            "name": "Duvet & Bedding Wash",
            "min": 3500,
            "max": 8000
          }
        ]
      }
    ]
  },
  {
    "slug": "beauty-personal-care",
    "name": "Beauty & Personal Care",
    "iconKey": "beauty",
    "subcategories": [
      {
        "slug": "beauty-personal-care-hair",
        "name": "Hair",
        "services": [
          {
            "name": "Hair Dressing",
            "min": 3000,
            "max": 8000
          },
          {
            "name": "Hair Braiding",
            "min": 4000,
            "max": 15000
          },
          {
            "name": "Wig Installation",
            "min": 5000,
            "max": 15000
          },
          {
            "name": "Wig Styling & Revamp",
            "min": 4000,
            "max": 12000
          },
          {
            "name": "Hair Coloring",
            "min": 6000,
            "max": 20000
          },
          {
            "name": "Hair Treatment & Relaxing",
            "min": 5000,
            "max": 15000
          },
          {
            "name": "Barbering (Home Service)",
            "min": 2000,
            "max": 5000
          },
          {
            "name": "Kids Hair Styling",
            "min": 2500,
            "max": 6000
          },
          {
            "name": "Weave-on Installation",
            "min": 5000,
            "max": 12000
          },
          {
            "name": "Locs & Twists Maintenance",
            "min": 6000,
            "max": 18000
          }
        ]
      },
      {
        "slug": "beauty-personal-care-makeup-nails",
        "name": "Makeup & Nails",
        "services": [
          {
            "name": "Everyday Makeup",
            "min": 5000,
            "max": 12000
          },
          {
            "name": "Bridal Makeup",
            "min": 25000,
            "max": 80000
          },
          {
            "name": "Party/Event Makeup",
            "min": 8000,
            "max": 20000
          },
          {
            "name": "Nail Fixing (Acrylic)",
            "min": 5000,
            "max": 12000
          },
          {
            "name": "Manicure",
            "min": 3000,
            "max": 7000
          },
          {
            "name": "Pedicure",
            "min": 3500,
            "max": 8000
          },
          {
            "name": "Gel Polish",
            "min": 3000,
            "max": 6000
          },
          {
            "name": "Eyelash Installation",
            "min": 4000,
            "max": 10000
          },
          {
            "name": "Eyebrow Shaping & Tinting",
            "min": 2500,
            "max": 6000
          }
        ]
      },
      {
        "slug": "beauty-personal-care-skincare-wellness",
        "name": "Skincare & Wellness",
        "services": [
          {
            "name": "Facial Treatment",
            "min": 6000,
            "max": 18000
          },
          {
            "name": "Full Body Massage",
            "min": 8000,
            "max": 20000
          },
          {
            "name": "Head & Neck Massage",
            "min": 4000,
            "max": 9000
          },
          {
            "name": "Waxing (Full Body)",
            "min": 8000,
            "max": 20000
          },
          {
            "name": "Waxing (Partial)",
            "min": 3000,
            "max": 8000
          },
          {
            "name": "Spa Treatment at Home",
            "min": 10000,
            "max": 30000
          }
        ]
      }
    ]
  },
  {
    "slug": "plumbing",
    "name": "Plumbing",
    "iconKey": "plumbing",
    "subcategories": [
      {
        "slug": "plumbing-plumbing-repairs",
        "name": "Plumbing Repairs",
        "services": [
          {
            "name": "Pipe Repair",
            "min": 4000,
            "max": 12000
          },
          {
            "name": "Leak Repair",
            "min": 3500,
            "max": 10000
          },
          {
            "name": "Faucet Installation",
            "min": 3000,
            "max": 8000
          },
          {
            "name": "Sink Repair",
            "min": 3500,
            "max": 9000
          },
          {
            "name": "Toilet Repair",
            "min": 4000,
            "max": 12000
          },
          {
            "name": "Toilet Installation",
            "min": 8000,
            "max": 20000
          },
          {
            "name": "Water Heater Installation",
            "min": 10000,
            "max": 30000
          },
          {
            "name": "Water Heater Repair",
            "min": 5000,
            "max": 15000
          },
          {
            "name": "Drain Cleaning / Unclogging",
            "min": 4000,
            "max": 12000
          },
          {
            "name": "Water Tank Installation",
            "min": 15000,
            "max": 45000
          },
          {
            "name": "Borehole Pump Repair",
            "min": 10000,
            "max": 35000
          },
          {
            "name": "Plumbing Inspection",
            "min": 5000,
            "max": 12000
          },
          {
            "name": "Pipe Fitting (New Installation)",
            "min": 8000,
            "max": 25000
          },
          {
            "name": "Bathroom Fitting Installation",
            "min": 15000,
            "max": 45000
          },
          {
            "name": "Kitchen Sink Installation",
            "min": 8000,
            "max": 20000
          },
          {
            "name": "Water Filter/Purifier Installation",
            "min": 6000,
            "max": 18000
          }
        ]
      }
    ]
  },
  {
    "slug": "electrical",
    "name": "Electrical",
    "iconKey": "electrical",
    "subcategories": [
      {
        "slug": "electrical-electrical-work",
        "name": "Electrical Work",
        "services": [
          {
            "name": "General Electrical Repairs",
            "min": 4000,
            "max": 15000
          },
          {
            "name": "Socket Installation",
            "min": 2500,
            "max": 6000
          },
          {
            "name": "Light Fixture Installation",
            "min": 3000,
            "max": 8000
          },
          {
            "name": "Ceiling Fan Installation",
            "min": 4000,
            "max": 10000
          },
          {
            "name": "Standing/Wall Fan Repair",
            "min": 3000,
            "max": 7000
          },
          {
            "name": "Generator Servicing",
            "min": 6000,
            "max": 18000
          },
          {
            "name": "Generator Installation",
            "min": 10000,
            "max": 30000
          },
          {
            "name": "Inverter Installation",
            "min": 20000,
            "max": 60000
          },
          {
            "name": "Inverter Repair",
            "min": 8000,
            "max": 25000
          },
          {
            "name": "Solar Panel Installation",
            "min": 50000,
            "max": 250000
          },
          {
            "name": "House Wiring (Per Room)",
            "min": 15000,
            "max": 40000
          },
          {
            "name": "Electrical Inspection & Safety Check",
            "min": 6000,
            "max": 15000
          },
          {
            "name": "Circuit Breaker Replacement",
            "min": 5000,
            "max": 15000
          },
          {
            "name": "Changeover Switch Installation",
            "min": 8000,
            "max": 20000
          },
          {
            "name": "Security Light Installation",
            "min": 4000,
            "max": 12000
          },
          {
            "name": "Extension Board Wiring",
            "min": 2000,
            "max": 5000
          },
          {
            "name": "Doorbell / Intercom Installation",
            "min": 5000,
            "max": 15000
          }
        ]
      }
    ]
  },
  {
    "slug": "technology",
    "name": "Technology",
    "iconKey": "technology",
    "subcategories": [
      {
        "slug": "technology-device-repair",
        "name": "Device Repair",
        "services": [
          {
            "name": "Laptop Repair",
            "min": 5000,
            "max": 25000
          },
          {
            "name": "Phone Screen Repair",
            "min": 8000,
            "max": 30000
          },
          {
            "name": "Phone Battery Replacement",
            "min": 5000,
            "max": 15000
          },
          {
            "name": "Printer Repair",
            "min": 5000,
            "max": 20000
          },
          {
            "name": "Desktop Computer Repair",
            "min": 6000,
            "max": 25000
          },
          {
            "name": "Data Recovery",
            "min": 10000,
            "max": 40000
          },
          {
            "name": "Software Installation & Setup",
            "min": 3000,
            "max": 10000
          },
          {
            "name": "Virus Removal & System Cleanup",
            "min": 4000,
            "max": 12000
          },
          {
            "name": "Tablet Repair",
            "min": 6000,
            "max": 20000
          },
          {
            "name": "Gaming Console Repair",
            "min": 8000,
            "max": 25000
          }
        ]
      },
      {
        "slug": "technology-digital-services",
        "name": "Digital & Network Services",
        "services": [
          {
            "name": "Computer Setup (New PC)",
            "min": 5000,
            "max": 12000
          },
          {
            "name": "Home Network / WiFi Installation",
            "min": 6000,
            "max": 20000
          },
          {
            "name": "CCTV Installation (Per Camera)",
            "min": 15000,
            "max": 35000
          },
          {
            "name": "Website Development",
            "min": 80000,
            "max": 500000
          },
          {
            "name": "Website Maintenance (Monthly)",
            "min": 15000,
            "max": 60000
          },
          {
            "name": "Basic Graphic Design Job",
            "min": 5000,
            "max": 25000
          },
          {
            "name": "Router / WiFi Configuration",
            "min": 3000,
            "max": 8000
          },
          {
            "name": "Email & Cloud Backup Setup",
            "min": 4000,
            "max": 12000
          },
          {
            "name": "Smart Home Device Setup",
            "min": 6000,
            "max": 20000
          }
        ]
      }
    ]
  },
  {
    "slug": "automotive",
    "name": "Automotive",
    "iconKey": "automotive",
    "subcategories": [
      {
        "slug": "automotive-car-care",
        "name": "Car Care",
        "services": [
          {
            "name": "Mobile Car Wash",
            "min": 3000,
            "max": 8000
          },
          {
            "name": "Car Detailing (Interior & Exterior)",
            "min": 12000,
            "max": 35000
          },
          {
            "name": "Engine Bay Cleaning",
            "min": 5000,
            "max": 12000
          },
          {
            "name": "Car Vacuum & Interior Clean",
            "min": 3500,
            "max": 8000
          }
        ]
      },
      {
        "slug": "automotive-car-repair",
        "name": "Car Repair & Maintenance",
        "services": [
          {
            "name": "Mobile Mechanic Visit",
            "min": 5000,
            "max": 15000
          },
          {
            "name": "Battery Replacement",
            "min": 15000,
            "max": 45000
          },
          {
            "name": "Tire Repair (Puncture)",
            "min": 1500,
            "max": 4000
          },
          {
            "name": "Tire Replacement (Per Tire)",
            "min": 20000,
            "max": 60000
          },
          {
            "name": "AC Repair (Car)",
            "min": 8000,
            "max": 30000
          },
          {
            "name": "Car Diagnostics Scan",
            "min": 5000,
            "max": 12000
          },
          {
            "name": "Oil Change",
            "min": 8000,
            "max": 20000
          },
          {
            "name": "Brake Pad Replacement",
            "min": 10000,
            "max": 25000
          },
          {
            "name": "Towing Service",
            "min": 10000,
            "max": 40000
          },
          {
            "name": "Jump Start Service",
            "min": 3000,
            "max": 8000
          },
          {
            "name": "Wheel Alignment",
            "min": 8000,
            "max": 20000
          },
          {
            "name": "Wheel Balancing",
            "min": 5000,
            "max": 12000
          },
          {
            "name": "Car Key Programming",
            "min": 15000,
            "max": 45000
          },
          {
            "name": "Car AC Gas Refill",
            "min": 8000,
            "max": 20000
          },
          {
            "name": "Windscreen Replacement",
            "min": 20000,
            "max": 60000
          },
          {
            "name": "Car Interior Fumigation",
            "min": 5000,
            "max": 12000
          }
        ]
      }
    ]
  },
  {
    "slug": "home-improvement",
    "name": "Home Improvement",
    "iconKey": "home-improvement",
    "subcategories": [
      {
        "slug": "home-improvement-renovation",
        "name": "Renovation & Repairs",
        "services": [
          {
            "name": "Interior Painting (Per Room)",
            "min": 12000,
            "max": 35000
          },
          {
            "name": "Exterior Painting (Per Wall)",
            "min": 15000,
            "max": 45000
          },
          {
            "name": "POP Ceiling Installation",
            "min": 25000,
            "max": 80000
          },
          {
            "name": "Tiling (Per Sq. M)",
            "min": 3500,
            "max": 8000
          },
          {
            "name": "Carpentry \u2014 Furniture Repair",
            "min": 5000,
            "max": 20000
          },
          {
            "name": "Furniture Assembly",
            "min": 4000,
            "max": 12000
          },
          {
            "name": "Roofing Repair",
            "min": 15000,
            "max": 60000
          },
          {
            "name": "Welding & Metal Work",
            "min": 8000,
            "max": 30000
          },
          {
            "name": "Interior Decoration Consultation",
            "min": 15000,
            "max": 50000
          },
          {
            "name": "Curtain Installation",
            "min": 5000,
            "max": 15000
          },
          {
            "name": "Wallpaper Installation",
            "min": 15000,
            "max": 40000
          },
          {
            "name": "Door/Window Installation",
            "min": 10000,
            "max": 30000
          },
          {
            "name": "Handyman \u2014 General Repairs",
            "min": 4000,
            "max": 15000
          },
          {
            "name": "Locksmith Services",
            "min": 4000,
            "max": 15000
          }
        ]
      }
    ]
  },
  {
    "slug": "education",
    "name": "Education & Tutoring",
    "iconKey": "education",
    "subcategories": [
      {
        "slug": "education-academic-tutoring",
        "name": "Academic Tutoring",
        "services": [
          {
            "name": "Mathematics Tutoring (Per Session)",
            "min": 3000,
            "max": 8000
          },
          {
            "name": "English Tutoring (Per Session)",
            "min": 3000,
            "max": 8000
          },
          {
            "name": "Physics Tutoring (Per Session)",
            "min": 3500,
            "max": 9000
          },
          {
            "name": "Chemistry Tutoring (Per Session)",
            "min": 3500,
            "max": 9000
          },
          {
            "name": "Biology Tutoring (Per Session)",
            "min": 3000,
            "max": 8000
          },
          {
            "name": "WAEC/JAMB Exam Prep (Per Session)",
            "min": 4000,
            "max": 10000
          },
          {
            "name": "Primary School Homework Help",
            "min": 2500,
            "max": 6000
          },
          {
            "name": "Economics Tutoring (Per Session)",
            "min": 3000,
            "max": 8000
          },
          {
            "name": "Government Tutoring (Per Session)",
            "min": 3000,
            "max": 7000
          },
          {
            "name": "Literature Tutoring (Per Session)",
            "min": 3000,
            "max": 7000
          },
          {
            "name": "Geography Tutoring (Per Session)",
            "min": 3000,
            "max": 7000
          },
          {
            "name": "Further Mathematics Tutoring (Per Session)",
            "min": 3500,
            "max": 9000
          },
          {
            "name": "Special Needs Tutoring (Per Session)",
            "min": 4000,
            "max": 12000
          }
        ]
      },
      {
        "slug": "education-skills-lessons",
        "name": "Skills & Lessons",
        "services": [
          {
            "name": "Computer Lessons",
            "min": 3000,
            "max": 8000
          },
          {
            "name": "Coding Lessons (Per Session)",
            "min": 5000,
            "max": 15000
          },
          {
            "name": "Music Lessons (Per Session)",
            "min": 4000,
            "max": 12000
          },
          {
            "name": "Language Lessons (Per Session)",
            "min": 4000,
            "max": 10000
          },
          {
            "name": "Driving Lessons (Per Session)",
            "min": 4000,
            "max": 10000
          },
          {
            "name": "French Lessons (Per Session)",
            "min": 4000,
            "max": 10000
          },
          {
            "name": "Yoruba Lessons (Per Session)",
            "min": 3000,
            "max": 8000
          },
          {
            "name": "Igbo Lessons (Per Session)",
            "min": 3000,
            "max": 8000
          },
          {
            "name": "Hausa Lessons (Per Session)",
            "min": 3000,
            "max": 8000
          },
          {
            "name": "Public Speaking Coaching (Per Session)",
            "min": 5000,
            "max": 15000
          },
          {
            "name": "Career Coaching (Per Session)",
            "min": 6000,
            "max": 18000
          }
        ]
      }
    ]
  },
  {
    "slug": "events",
    "name": "Events",
    "iconKey": "events",
    "subcategories": [
      {
        "slug": "events-event-services",
        "name": "Event Services",
        "services": [
          {
            "name": "Event Decoration",
            "min": 30000,
            "max": 150000
          },
          {
            "name": "Event Photography",
            "min": 25000,
            "max": 100000
          },
          {
            "name": "Event Videography",
            "min": 30000,
            "max": 120000
          },
          {
            "name": "Catering (Per Head)",
            "min": 2500,
            "max": 6000
          },
          {
            "name": "DJ Services",
            "min": 20000,
            "max": 80000
          },
          {
            "name": "MC / Event Host",
            "min": 20000,
            "max": 70000
          },
          {
            "name": "Event Planning & Coordination",
            "min": 50000,
            "max": 300000
          },
          {
            "name": "Event Security Personnel (Per Guard)",
            "min": 8000,
            "max": 15000
          },
          {
            "name": "Ushering Services (Per Usher)",
            "min": 6000,
            "max": 12000
          },
          {
            "name": "Cake Making & Design",
            "min": 10000,
            "max": 50000
          },
          {
            "name": "Live Band Performance",
            "min": 50000,
            "max": 250000
          },
          {
            "name": "Canopy & Chair Rental Setup",
            "min": 20000,
            "max": 60000
          },
          {
            "name": "Balloon Decoration",
            "min": 10000,
            "max": 40000
          },
          {
            "name": "Photo Booth Rental",
            "min": 25000,
            "max": 70000
          },
          {
            "name": "Sound Equipment Rental",
            "min": 20000,
            "max": 60000
          },
          {
            "name": "Traditional Attire Rental",
            "min": 10000,
            "max": 35000
          },
          {
            "name": "Generator Rental (Event)",
            "min": 25000,
            "max": 70000
          },
          {
            "name": "Master of Ceremonies \u2014 Traditional",
            "min": 25000,
            "max": 80000
          }
        ]
      }
    ]
  },
  {
    "slug": "delivery-logistics",
    "name": "Delivery & Logistics",
    "iconKey": "delivery-logistics",
    "subcategories": [
      {
        "slug": "delivery-logistics-delivery",
        "name": "Delivery & Errands",
        "services": [
          {
            "name": "Food Delivery",
            "min": 800,
            "max": 3000
          },
          {
            "name": "Parcel Delivery (Within City)",
            "min": 1200,
            "max": 4000
          },
          {
            "name": "Moving Services (Studio/1-Bed)",
            "min": 20000,
            "max": 50000
          },
          {
            "name": "Moving Services (2-3 Bed)",
            "min": 40000,
            "max": 120000
          },
          {
            "name": "Errand Running",
            "min": 2000,
            "max": 6000
          },
          {
            "name": "Shopping Assistance",
            "min": 2500,
            "max": 7000
          },
          {
            "name": "Pickup & Drop-off Service",
            "min": 1500,
            "max": 5000
          },
          {
            "name": "Interstate Parcel Delivery",
            "min": 5000,
            "max": 20000
          }
        ]
      }
    ]
  },
  {
    "slug": "garden-outdoor",
    "name": "Garden & Outdoor",
    "iconKey": "garden-outdoor",
    "subcategories": [
      {
        "slug": "garden-outdoor-garden",
        "name": "Garden & Outdoor Care",
        "services": [
          {
            "name": "Gardening (General)",
            "min": 4000,
            "max": 10000
          },
          {
            "name": "Lawn Mowing",
            "min": 3500,
            "max": 9000
          },
          {
            "name": "Landscaping Design & Setup",
            "min": 25000,
            "max": 100000
          },
          {
            "name": "Tree Trimming",
            "min": 6000,
            "max": 20000
          },
          {
            "name": "Tree Removal",
            "min": 15000,
            "max": 50000
          },
          {
            "name": "Weed Removal",
            "min": 3000,
            "max": 8000
          },
          {
            "name": "Garden Maintenance (Monthly)",
            "min": 10000,
            "max": 30000
          },
          {
            "name": "Compound Clearing",
            "min": 8000,
            "max": 25000
          },
          {
            "name": "Irrigation System Installation",
            "min": 20000,
            "max": 60000
          },
          {
            "name": "Fish Pond Maintenance",
            "min": 8000,
            "max": 25000
          },
          {
            "name": "Flower Bed Design & Planting",
            "min": 10000,
            "max": 30000
          }
        ]
      }
    ]
  },
  {
    "slug": "pets",
    "name": "Pets",
    "iconKey": "pets",
    "subcategories": [
      {
        "slug": "pets-pet-care",
        "name": "Pet Care",
        "services": [
          {
            "name": "Dog Walking (Per Walk)",
            "min": 2000,
            "max": 5000
          },
          {
            "name": "Pet Grooming",
            "min": 5000,
            "max": 15000
          },
          {
            "name": "Pet Sitting (Per Day)",
            "min": 4000,
            "max": 10000
          },
          {
            "name": "Pet Training (Per Session)",
            "min": 5000,
            "max": 15000
          },
          {
            "name": "Veterinary Assistance Visit",
            "min": 6000,
            "max": 20000
          },
          {
            "name": "Pet Boarding (Per Day)",
            "min": 5000,
            "max": 12000
          },
          {
            "name": "Aquarium Cleaning",
            "min": 3500,
            "max": 9000
          }
        ]
      }
    ]
  },
  {
    "slug": "child-family",
    "name": "Child & Family",
    "iconKey": "babysitting",
    "subcategories": [
      {
        "slug": "child-family-family-care",
        "name": "Family Care",
        "services": [
          {
            "name": "Babysitting (Per Hour)",
            "min": 1500,
            "max": 3500
          },
          {
            "name": "Full-Day Childcare",
            "min": 6000,
            "max": 15000
          },
          {
            "name": "Live-in Nanny (Weekly)",
            "min": 15000,
            "max": 35000
          },
          {
            "name": "Elderly Companion Care (Per Day)",
            "min": 6000,
            "max": 15000
          },
          {
            "name": "House Sitting (Per Day)",
            "min": 4000,
            "max": 10000
          },
          {
            "name": "Postnatal Support (Per Day)",
            "min": 8000,
            "max": 20000
          }
        ]
      }
    ]
  },
  {
    "slug": "cooking-catering",
    "name": "Cooking & Catering",
    "iconKey": "cooking",
    "subcategories": [
      {
        "slug": "cooking-catering-home-cooking",
        "name": "Home Cooking",
        "services": [
          {
            "name": "Personal Chef (Per Visit)",
            "min": 6000,
            "max": 18000
          },
          {
            "name": "Meal Prep (Weekly)",
            "min": 10000,
            "max": 30000
          },
          {
            "name": "Small Chops Preparation",
            "min": 8000,
            "max": 25000
          },
          {
            "name": "Party Jollof Rice Catering (Per Pot)",
            "min": 15000,
            "max": 35000
          },
          {
            "name": "Continental Cooking Service",
            "min": 8000,
            "max": 20000
          },
          {
            "name": "Baking Classes (Per Session)",
            "min": 5000,
            "max": 15000
          },
          {
            "name": "Private Dinner Party Chef",
            "min": 20000,
            "max": 60000
          },
          {
            "name": "Meal Delivery Subscription (Weekly)",
            "min": 15000,
            "max": 40000
          },
          {
            "name": "Birthday Cake & Pastries",
            "min": 8000,
            "max": 30000
          },
          {
            "name": "Grilling & BBQ Service",
            "min": 10000,
            "max": 30000
          }
        ]
      }
    ]
  },
  {
    "slug": "appliance-repair",
    "name": "Appliance Repair",
    "iconKey": "wrench",
    "subcategories": [
      {
        "slug": "appliance-repair-appliance",
        "name": "Home Appliance Repair",
        "services": [
          {
            "name": "Refrigerator Repair",
            "min": 6000,
            "max": 18000
          },
          {
            "name": "Air Conditioner Servicing",
            "min": 6000,
            "max": 15000
          },
          {
            "name": "Air Conditioner Repair",
            "min": 8000,
            "max": 25000
          },
          {
            "name": "Air Conditioner Gas Refill",
            "min": 8000,
            "max": 20000
          },
          {
            "name": "Washing Machine Repair",
            "min": 6000,
            "max": 20000
          },
          {
            "name": "Microwave Repair",
            "min": 4000,
            "max": 12000
          },
          {
            "name": "Gas Cooker Repair",
            "min": 4000,
            "max": 12000
          },
          {
            "name": "Gas Cooker Installation",
            "min": 3500,
            "max": 9000
          },
          {
            "name": "Water Dispenser Repair",
            "min": 3500,
            "max": 9000
          },
          {
            "name": "Smart TV Repair",
            "min": 6000,
            "max": 20000
          },
          {
            "name": "Blender & Mixer Repair",
            "min": 2500,
            "max": 6000
          },
          {
            "name": "Home Theatre / Sound System Setup",
            "min": 5000,
            "max": 15000
          }
        ]
      },
      {
        "slug": "appliance-repair-pest-control",
        "name": "Pest Control",
        "services": [
          {
            "name": "General Fumigation",
            "min": 8000,
            "max": 20000
          },
          {
            "name": "Termite Treatment",
            "min": 15000,
            "max": 40000
          },
          {
            "name": "Rodent Control",
            "min": 6000,
            "max": 15000
          },
          {
            "name": "Bed Bug Treatment",
            "min": 10000,
            "max": 25000
          },
          {
            "name": "Mosquito Fogging",
            "min": 6000,
            "max": 15000
          }
        ]
      }
    ]
  },
  {
    "slug": "business-professional",
    "name": "Business & Professional",
    "iconKey": "laptop",
    "subcategories": [
      {
        "slug": "business-professional-office-support",
        "name": "Office & Admin Support",
        "services": [
          {
            "name": "Bookkeeping (Monthly)",
            "min": 15000,
            "max": 50000
          },
          {
            "name": "Tax Filing Assistance",
            "min": 10000,
            "max": 40000
          },
          {
            "name": "CV Writing & Review",
            "min": 5000,
            "max": 15000
          },
          {
            "name": "Virtual Assistant (Per Hour)",
            "min": 2500,
            "max": 6000
          },
          {
            "name": "Document Translation (Per Page)",
            "min": 2000,
            "max": 6000
          },
          {
            "name": "Notary / Document Certification",
            "min": 3000,
            "max": 10000
          },
          {
            "name": "Business Plan Writing",
            "min": 20000,
            "max": 80000
          },
          {
            "name": "Data Entry (Per Project)",
            "min": 5000,
            "max": 20000
          }
        ]
      },
      {
        "slug": "business-professional-marketing-content",
        "name": "Marketing & Content",
        "services": [
          {
            "name": "Social Media Content Creation",
            "min": 15000,
            "max": 50000
          },
          {
            "name": "Product Photography",
            "min": 10000,
            "max": 30000
          },
          {
            "name": "Portrait Photography Session",
            "min": 10000,
            "max": 30000
          },
          {
            "name": "Drone Photography/Videography",
            "min": 20000,
            "max": 60000
          },
          {
            "name": "Voiceover Recording",
            "min": 5000,
            "max": 20000
          },
          {
            "name": "Logo Design",
            "min": 8000,
            "max": 30000
          }
        ]
      }
    ]
  },
  {
    "slug": "security",
    "name": "Security Services",
    "iconKey": "shield",
    "subcategories": [
      {
        "slug": "security-home-security",
        "name": "Home & Event Security",
        "services": [
          {
            "name": "Security Guard Hire (Per Shift)",
            "min": 6000,
            "max": 15000
          },
          {
            "name": "Event Security Detail (Per Guard)",
            "min": 8000,
            "max": 15000
          },
          {
            "name": "Home Security Audit",
            "min": 10000,
            "max": 25000
          },
          {
            "name": "Safe Installation",
            "min": 8000,
            "max": 25000
          },
          {
            "name": "CCTV Monitoring Setup (Monthly)",
            "min": 10000,
            "max": 30000
          },
          {
            "name": "Access Control Installation",
            "min": 20000,
            "max": 60000
          }
        ]
      }
    ]
  },
  {
    "slug": "fitness-wellness",
    "name": "Fitness & Wellness",
    "iconKey": "sprout",
    "subcategories": [
      {
        "slug": "fitness-wellness-personal-training",
        "name": "Personal Training & Coaching",
        "services": [
          {
            "name": "Personal Trainer (Per Session)",
            "min": 5000,
            "max": 15000
          },
          {
            "name": "Yoga Instructor (Per Session)",
            "min": 5000,
            "max": 12000
          },
          {
            "name": "Nutrition Coaching (Per Session)",
            "min": 6000,
            "max": 18000
          },
          {
            "name": "Home Gym Setup Consultation",
            "min": 8000,
            "max": 20000
          },
          {
            "name": "Group Fitness Class (Per Person)",
            "min": 3000,
            "max": 8000
          }
        ]
      }
    ]
  }
];
