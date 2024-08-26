window.onload = () => {
  populateStates();
};

// Populate states dropdown
function populateStates() {
  const stateSelect = document.getElementById("state");
  for (let state in data) {
    let option = document.createElement("option");
    option.value = state;
    option.textContent = state;
    stateSelect.appendChild(option);
  }
}

// Filter districts based on selected state
function filterDistricts() {
  const stateSelect = document.getElementById("state");
  const districtSelect = document.getElementById("district");
  const hospitalSelect = document.getElementById("hospital");
  const selectedState = stateSelect.value;

  // Clear previous selections
  districtSelect.innerHTML = '<option value="">Select District</option>';
  hospitalSelect.innerHTML = '<option value="">Select Hospital</option>';
  document.getElementById("availability").innerHTML = "";
  document.getElementById("booking-form").style.display = "none"; // Hide booking form

  if (selectedState) {
    const districts = data[selectedState];
    for (let district in districts) {
      let option = document.createElement("option");
      option.value = district;
      option.textContent = district;
      districtSelect.appendChild(option);
    }
  }
}

// Filter hospitals based on selected district
function filterHospitals() {
  const stateSelect = document.getElementById("state");
  const districtSelect = document.getElementById("district");
  const hospitalSelect = document.getElementById("hospital");
  const selectedState = stateSelect.value;
  const selectedDistrict = districtSelect.value;

  // Clear previous hospital selection
  hospitalSelect.innerHTML = '<option value="">Select Hospital</option>';
  document.getElementById("availability").innerHTML = "";
  document.getElementById("booking-form").style.display = "none"; // Hide booking form

  if (selectedState && selectedDistrict) {
    const hospitals = data[selectedState][selectedDistrict];
    hospitals.forEach((hospital, index) => {
      let option = document.createElement("option");
      option.value = index; // Use index to refer to the hospital object
      option.textContent = hospital.name;
      hospitalSelect.appendChild(option);
    });
  }
}

// Add event listener to handle hospital selection and display availability
document.getElementById("hospital").addEventListener("change", function () {
  const stateSelect = document.getElementById("state");
  const districtSelect = document.getElementById("district");
  const hospitalSelect = document.getElementById("hospital");
  const selectedState = stateSelect.value;
  const selectedDistrict = districtSelect.value;
  const selectedHospitalIndex = hospitalSelect.value;

  if (selectedState && selectedDistrict && selectedHospitalIndex !== "") {
    const hospital =
      data[selectedState][selectedDistrict][selectedHospitalIndex];
    displayBedAvailability(hospital);
    displayQueues(hospital);
  }
});

// Function to display bed availability in a hospital
function displayBedAvailability(hospital) {
  const availabilityDiv = document.getElementById("availability");
  availabilityDiv.innerHTML = `<h2>${hospital.name}</h2>`;

  for (let floor in hospital.floors) {
    let floorInfo = `<h3>Floor ${floor}</h3>`;
    for (let room in hospital.floors[floor].rooms) {
      const roomInfo = hospital.floors[floor].rooms[room];
      const status = roomInfo.status;
      const patient = roomInfo.patient;
      let tooltipText = `Room ${room} has ${roomInfo.beds} (${status}).`;

      if (patient) {
        tooltipText += ` Check-in: ${patient.checkIn}, Check-out: ${patient.checkOut}.`;
      }

      // Adding class 'room-info' and a title attribute for hover text
      floorInfo += `<p class="room-info" title="${tooltipText}" onclick="showBookingForm('${floor}', '${room}')">${room}: ${roomInfo.beds} - ${status}</p>`;
    }
    availabilityDiv.innerHTML += floorInfo;
  }
}

// Function to display OPD and admission queues
function displayQueues(hospital) {
  const availabilityDiv = document.getElementById("availability");
  let opdInfo = "<h3>OPD Queue</h3>";
  let admissionInfo = "<h3>Admission Queue</h3>";

  hospital.opdQueue.forEach((patient) => {
    opdInfo += `<p>Patient: ${patient.name}, Check-in: ${patient.checkIn}, Status: ${patient.status}</p>`;
  });

  hospital.admissionQueue.forEach((patient) => {
    admissionInfo += `<p>Patient: ${patient.name}, Requested Room: ${patient.requestedRoom}, Status: ${patient.status}</p>`;
  });

  availabilityDiv.innerHTML += opdInfo + admissionInfo;
}

// Show booking form and set selected room details
function showBookingForm(floor, room) {
  document.getElementById("booking-form").style.display = "block";
  const bookingForm = document.getElementById("bookingForm");
  bookingForm.dataset.floor = floor;
  bookingForm.dataset.room = room;
}

// Handle booking form submission
document
  .getElementById("bookingForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const patientName = document.getElementById("patientName").value;
    const patientAge = document.getElementById("patientAge").value;
    const diseaseName = document.getElementById("diseaseName").value;
    const mobileNo = document.getElementById("mobileNo").value;

    const stateSelect = document.getElementById("state");
    const districtSelect = document.getElementById("district");
    const hospitalSelect = document.getElementById("hospital");
    const selectedState = stateSelect.value;
    const selectedDistrict = districtSelect.value;
    const selectedHospitalIndex = hospitalSelect.value;

    if (selectedState && selectedDistrict && selectedHospitalIndex !== "") {
      const hospital =
        data[selectedState][selectedDistrict][selectedHospitalIndex];
      const floor = this.dataset.floor;
      const room = this.dataset.room;
      const roomInfo = hospital.floors[floor].rooms[room];

      if (roomInfo.status === "available") {
        roomInfo.status = "occupied";
        roomInfo.patient = {
          name: patientName,
          age: patientAge,
          disease: diseaseName,
          mobileNo: mobileNo,
          checkIn: new Date().toISOString().split("T")[0],
          checkOut: null, // Set check-out time based on hospital policies
        };

        // Optionally update the central module with the new booking information
        updateCityModule(data);

        alert("Room booked successfully!");

        // Hide the booking form and reset it
        document.getElementById("booking-form").style.display = "none";
        document.getElementById("bookingForm").reset();

        // Refresh the availability display
        displayBedAvailability(hospital);
      } else {
        alert("Selected room is not available for booking.");
      }
    }
  });

// Function to cancel booking form
function cancelBooking() {
  document.getElementById("booking-form").style.display = "none";
  document.getElementById("bookingForm").reset();
}

// Mock data structure for testing
const data = {
  TamilNadu: {
    Erode: [
      {
        name: "KMCH Multi Speciality Hospital",
        floors: {
          1: {
            rooms: {
              101: {
                beds: "1 bed",
                status: "occupied",
                patient: { checkIn: "2024-08-20", checkOut: "2024-08-25" },
              },
              102: { beds: "1 bed", status: "available", patient: null },
              // if you want to add a adtional rooms here
            },
          },
          // if you want to add additional floors here
          // 2: {},
        },
        opdQueue: [
          {
            patientId: "P001",
            name: "John Doe",
            checkIn: "09:00",
            status: "waiting",
          },
          {
            patientId: "P002",
            name: "Jane Smith",
            checkIn: "09:15",
            status: "in treatment",
          },
        ],
        admissionQueue: [
          {
            patientId: "A001",
            name: "Mary Johnson",
            requestedRoom: "101",
            status: "waiting",
          },
          {
            patientId: "A002",
            name: "James Wilson",
            requestedRoom: "102",
            status: "admitted",
          },
        ],
      },
      {
        name: "Senthil Multi Speciality Hospital",
        floors: {
          1: {
            rooms: {
              101: {
                beds: "1 bed",
                status: "occupied",
                patient: { checkIn: "2024-08-20", checkOut: "2024-08-25" },
              },
              102: { beds: "1 bed", status: "available", patient: null },
            },
          },
        },
        opdQueue: [
          {
            patientId: "P001",
            name: "John Doe",
            checkIn: "09:00",
            status: "waiting",
          },
          {
            patientId: "P002",
            name: "Jane Smith",
            checkIn: "09:15",
            status: "in treatment",
          },
        ],
        admissionQueue: [
          {
            patientId: "A001",
            name: "Mary Johnson",
            requestedRoom: "101",
            status: "waiting",
          },
          {
            patientId: "A002",
            name: "James Wilson",
            requestedRoom: "102",
            status: "admitted",
          },
        ],
      },
    ],
    Coimbatore: [
      {
        name: "Geethasree Hospitals",
        floors: {
          1: {
            rooms: {
              101: {
                beds: "1 bed",
                status: "occupied",
                patient: { checkIn: "2024-08-20", checkOut: "2024-08-25" },
              },
              102: { beds: "1 bed", status: "available", patient: null },
            },
          },
        },
        opdQueue: [
          {
            patientId: "P001",
            name: "John Doe",
            checkIn: "09:00",
            status: "waiting",
          },
          {
            patientId: "P002",
            name: "Jane Smith",
            checkIn: "09:15",
            status: "in treatment",
          },
        ],
        admissionQueue: [
          {
            patientId: "A001",
            name: "Mary Johnson",
            requestedRoom: "101",
            status: "waiting",
          },
          {
            patientId: "A002",
            name: "James Wilson",
            requestedRoom: "102",
            status: "admitted",
          },
        ],
      },
      {
        name: "FIMS Hospitals",
        floors: {
          1: {
            rooms: {
              101: {
                beds: "1 bed",
                status: "occupied",
                patient: { checkIn: "2024-08-20", checkOut: "2024-08-25" },
              },
              102: { beds: "1 bed", status: "available", patient: null },
            },
          },
        },
        opdQueue: [
          {
            patientId: "P001",
            name: "John Doe",
            checkIn: "09:00",
            status: "waiting",
          },
          {
            patientId: "P002",
            name: "Jane Smith",
            checkIn: "09:15",
            status: "in treatment",
          },
        ],
        admissionQueue: [
          {
            patientId: "A001",
            name: "Mary Johnson",
            requestedRoom: "101",
            status: "waiting",
          },
          {
            patientId: "A002",
            name: "James Wilson",
            requestedRoom: "102",
            status: "admitted",
          },
        ],
      },
    ],
    Salem: [],
    Ariyalur: [],
    Chengalpattu: [],
    Chennai: [],
    Cuddalore: [],
    Dharmapuri: [],
    Dindigul: [],
    Kallakurichi: [],
    Kanchipuram: [],
    Kanyakumari: [],
    Karur: [],
    Krishnagiri: [],
    Madurai: [],
    Mayiladuthurai: [],
    Nagapattinam: [],
    Namakkal: [],
    Nilgiris: [],
    Perambalur: [],
    Pudukkottai: [],
    Ramanathapuram: [],
    Ranipet: [],
    Salem: [],
    Sivaganga: [],
    Tenkasi: [],
    Thanjavur: [],
    Theni: [],
    Tuticorin: [],
    Trichy: [],
    Tirunelveli: [],
    Tirupattur: [],
    Tiruppur: [],
    Tiruvallur: [],
    Tiruvannamalai: [],
    Tiruvarur: [],
    Vellore: [],
    Villupuram: [],
    Virudhunagar: [],
  },
  AndhraPradesh: {},
  ArunachalPradesh: {},
  Assam: {},
  Bihar: {},
  Chhattisgarh: {},
  Goa: {},
  Gujarat: {},
  Haryana: {},
  HimachalPradesh: {},
  Jharkhand: {},
  Karnataka: {},
  Kerala: {},
  MadhyaPradesh: {},
  Maharashtra: {},
  Mizoram: {},
  Nagaland: {},
  Odisha: {},
  Punjab: {},
  Rajasthan: {},
  Sikkim: {},
  Telangana: {},
  Tripura: {},
  UttarPradesh: {},
  Uttarakhand: {},
  WestBengal: {},
};

// Mock function to simulate updating a central city-wide module
function updateCityModule(hospitalData) {
  console.log(
    "Updating city module with new booking information:",
    hospitalData
  );
  // In a real application, this would send the data to a server
}
