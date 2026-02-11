def number_generator():
    for i in range(1, 11):
        yield i

if __name__ == "__main__":
    gen = number_generator()
    for num in gen:
        print(num)