
-- *Step 1* 
-- Copy This Command below in create-db-template.sql and click 'run' :
--  CREATE DATABASE group5_db;

-- *Step 2* 
-- Click run --
use group5_db;

-- *Step 3* 
-- Click run --
CREATE TABLE car_table (
    id INT AUTO_INCREMENT PRIMARY KEY, --   This is the unique identifier for each entry in the table.
    token_id INT NOT NULL UNIQUE,      --   A unique identifier for each car, linked with the Ethereum 
                                       -- blockchain to represent the asset associated with the car.
    owner VARCHAR(255) NOT NULL,       --   The current owner of the car  
    seller VARCHAR(255) NOT NULL,      --   The seller of the car (this may differ from the owner 
                                       -- if the car is being sold).
    title VARCHAR(255),                --   The title of the car (e.g., "Porsche 911").
    price DECIMAL(10,2) NOT NULL,      --   The price of the car, stored in ETH.
    category VARCHAR(50),              --   The car's category, such as SUV, Sedan, etc.
    car_condition VARCHAR(50),         --   The condition of the car, e.g., "new" or "used."
    created_date DATE ,                --   The date the car was listed for sale.
    image_path VARCHAR(500),           --   The path to the car's image stored on the server.
    description TEXT,                  --   A detailed description of the car.
    currently_listed BOOLEAN DEFAULT TRUE --    A flag indicating whether the car is currently 
                                          -- listed for sale (default is TRUE).
);

-- Click run --
CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,   --   Unique identifier for each transaction.            
    token_id INT NOT NULL,               --   Foreign key that references the token_id in the car_table.
                                         -- It connects each transaction to a specific car.         
    buyer VARCHAR(255),                  --   The Ethereum address of the buyer. (example: 0x123...abc)        
    seller VARCHAR(255),                 --   The Ethereum address of the seller. (example: 0x123...3bf)
    price DECIMAL(10,2) NOT NULL,        --   The transaction amount, stored in ETH.
    --   Describes the state of the transaction(Received/Transfer).          
    transaction_type ENUM('Received', 'Transfer') NOT NULL, 
    --   The date and time when the transaction took place
    transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP , 
    --   The token_id field references the car_table, ensuring that the transaction is linked to a specific car.
    FOREIGN KEY (token_id) REFERENCES car_table(token_id) ON DELETE CASCADE
    

);

-- Click run --
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY, --   Unique identifier for each user.
    token_id INT NOT NULL,             --   Foreign key linking the user to a specific car from the car_table. 
                                       -- This ties the user to the car they own or have listed for sale.
    users_name VARCHAR(255) NOT NULL,  --   The name of the user or buyer
    FOREIGN KEY (token_id) REFERENCES car_table(token_id) ON DELETE CASCADE
);


-- Click run --
SELECT * FROM car_table;

SELECT * FROM transactions;
SELECT * FROM users;