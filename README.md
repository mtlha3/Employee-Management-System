# Employee Management System 🚀

A **Role-Based Project & Employee Management System** built with **JWT Authentication**, designed to streamline team collaboration, task management, and leave tracking in a project-driven environment. This system supports multiple user roles: **HR**, **Project Manager**, **Team Lead**, and **Developer** — each with specific responsibilities and access rights.


## 🔐 Roles & Permissions

### 👤 HR

* Manages overall employee data.
* Oversees system roles and assignments.

### 🧑‍💼 Project Manager

* Creates new projects.
* Assigns **Team Leads** to projects.
* Can view project logs to track progress and submissions.

### 👨‍🏫 Team Lead

* Adds **Developers** to their assigned project (one-time assignment per developer).
* Assigns tasks to developers.
* Reviews task submissions.
* Updates submission status to:

  * ✅ Completed
  * 🔁 Revision Required
  * ❌ Not Completed
* Can view project logs to monitor task progress and team contributions.

### 👨‍💻 Developer

* Can view tasks assigned by the Team Lead.
* Submits work with optional comments or files.
* Re-submits if revisions are requested.


## 📅 Leave Management

* **All employees** (except HR) can request leave through the system.
* Leave requests are visible to appropriate HR for review and approval.


## 📝 Key Features

* 🔒 **JWT-based Role Authentication**
  Secure access control for each user role.

* 📁 **Project & Task Management**
  End-to-end flow from project creation to task submission tracking.

* 👨‍👩‍👧‍👦 **Team Assignment Rules**
  Developers can be assigned **only once** to a project.

* ✅ **Task Submission Flow**

  * Assigned → Submitted → Reviewed → Completed / Revision Required.

* 📊 **Project Log Page**
  Real-time logging for Project Managers and Team Leads to monitor activities.



## 🧪 Tech Stack

* **Frontend:** React.js
* **Backend:** Node.js, Express.js
* **Authentication:** JWT (JSON Web Tokens)
* **Database:** MongoDB
* **Alerts/Feedback:** SweetAlert or custom notifications
* **Hosting:** Vercel / Render
