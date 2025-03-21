# diaScript

diaScript is a simple scripting language interpreter built with Node.js. This guide will help you set up the project, install dependencies, and run scripts.

## Prerequisites

- Node.js (v22.14.0 or later)
- npm (Node Package Manager)

## Setup

1. **Clone the repository**

   git clone https://github.com/karagurimutixa/diaScript.git
   cd diaScript
.
2. **Install dependencies**
npm install

3. **Set up the PATH**
To run the dia command from anywhere, you need to add the project directory to your system's PATH.

Windows

Open the Start Search, type in "env", and select "Edit the system environment variables".
In the System Properties window, click on the "Environment Variables" button.
In the Environment Variables window, select the "Path" variable in the "System variables" section and click "Edit".
Click "New" and add the path to the diaScript directory (e.g., C:\Path\To\diaScript).
Click "OK" to close all windows.
macOS/Linux

Open a terminal.

Open your shell profile file (e.g., ~/.bashrc, ~/.zshrc, ~/.profile) in a text editor.

Add the following line to the file:
export PATH=$PATH:/path/to/diaScript
4. Save the file and run the following command to apply the changes:
source ~/.bashrc  # or source ~/.zshrc, source ~/.profile

## Usage
Create a script file

Create a new file with the .ds extension (e.g., myfile.ds) and add your script content. Here is an example:
set x to 5;
add x and 5 into result;
if result > 10 then terminal_print("x + 5 is bigger than 10") else terminal_print("x + 5 isn't bigger than 10");

2. Run the script

Use the dia command to run your script:
dia st myfile.ds

## Syntax
1. Print to Terminal:
terminal_print("Hello, World");

2. Variable Assignment
set x to 10;

3. Arithmetic Operations
add x and 5 into y;

4. Conditional Statements:
if x > 5 then terminal_print("x is greater then 5")

5. Loops
repeat 5 times do terminal_print("Hello!");

6. Functions
define greet(name) as terminal_print("Hello, " + name + "!");
call greet("World");

## Contributing
Contributions are welcome! Please open an issue or submit a pull request on GitHub.

## License
This project is licensed under the MIT License.

This `readme.md` file provides detailed instructions for setting up and using the `diaScript` project, including installing dependencies, setting up the PATH, creating and running scripts, and understanding the syntax.This `readme.md` file provides detailed instructions for setting up and using the `diaScript` project, including installing dependencies, setting up the PATH, creating and running scripts, and understanding the syntax.