  # ProjectPulse
  
  ### DESCRIPTION

    
    This product will serve as tracking tool for projects and portfolio for each GDO and overall organisation,For this Only Backend Developed by using Nodejs.
  
  ### TO DOWNLOAD THE PROJECT
  
  Download the Git repository Manually  or clone it By Entering the following Command
  ~~~
  git clone https://github.com/anudeepthi166/WAL_MiniProject_ProjectPulse.git
  ~~~
  
  ### CONFIGURATIONS
  
  Create .env file and add the fooloeing into it
  
  ~~~
  DB_NAME=DataBase_Name
  DB_USER=DataBase_User
  DB_PASSWORD=DataBase_Password
  PORT=Port_Number
  SECRET_KEY=Secret_Key
  EMAIL_SERVICE_PROVIDE=Email_Service_Provider
  EMAIL=Your_Email
  EMAIL_PASSWORD=Your_Email_App_Password
  ~~~
  
  For this Project Create a database named ```Project_Pulse```
  
  Here,We assumed No employee details are stored in the database ,so To store all the Employee details ,I have created a seperate Route,By which one can register the Employee 
  
 # OVERVIEW
 
 ### Roles In The Project
 
          ```
          GDO Head
          Project Manager
          HR Manager
          Admin Users
          Super Admin
          ```
          
  ### Tasks Of The Roles
  ### Super Admin
  ```
  Can get all the Users/Employees details
  Assign the ROLES to the Employees
  ```
   
   
  ### Admin
  ```
  Get all the projects in The Organization
  Get Specific Project Details
      -Project Detailed View
      -Project Updates
      -Project Concerns
      -Team Composition
  Create A Project
  Update The Existing Project
  
  ```
  
   ### GDO Head (GDO-Global Delivery Organization)
  ```
  Get all the projects under his maintenance
  Get Specific Project Details
      -Project Detailed View
      -Project Updates
      -Project Concerns
      -Team Composition
  Assign the Employyes to Projects
  Update EMployees In the Project
  ```
  
   ### Project Manager
  ```
  Get all the projects under his maintenance
  Get Specific Project Details
      -Project Detailed View
      -Project Updates
      -Project Concerns
      -Team Composition
  Adding Project Updates
  Raise Resource Requests
  ```
  
  

