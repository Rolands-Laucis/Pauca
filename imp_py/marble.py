#cd imp_py
#python marble.py -s "." -i "." -o "."

import argparse
import re

def Transpile(args) -> str:
    # TODO
    return "TODO..."

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Runs the Marble engine transpilation on an input script.')
    parser.add_argument('-s', '--syntax', type=str, required=True, help='Path to the transpilation syntax .marble file.')
    parser.add_argument('-i', '--input', type=str, required=True, help='Path to the input source code plain text file.')
    parser.add_argument('-o', '--output', type=str, required=True, help='Path to the target source code plain text file.')
    args = parser.parse_args()

    output = Transpile(args)

    print(output)