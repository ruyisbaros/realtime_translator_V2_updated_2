import time

# Dictionary to store timing results
timing_results = {}


def time_it(label, func, *args, **kwargs):
    """
    Measure the execution time of a function.
    Args:
        label (str): A label to identify the operation.
        func (callable): The function to measure.
        *args: Positional arguments for the function.
        **kwargs: Keyword arguments for the function.
    Returns:
        The result of the function and the elapsed time.
    """
    start_time = time.time()
    result = func(*args, **kwargs)
    elapsed_time = time.time() - start_time

    # Store timing
    if label in timing_results:
        previous_time = timing_results[label]
        improvement = (previous_time - elapsed_time) / previous_time * 100
        print(f"{label}: {elapsed_time:.2f}s (Improved by {improvement:.2f}%)")
    else:
        print(f"{label}: {elapsed_time:.2f}s (First Run)")

    # Update timing results
    timing_results[label] = elapsed_time
    return result, elapsed_time
